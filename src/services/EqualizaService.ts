import { CostVariable } from './ConferenciaService';
import { generateUUID } from '@/lib/utils';

export type EqualizaPaymentPlanMode = 'semestral' | 'anual' | 'trimestral' | 'personalizado';

export interface EqualizaPaymentItem {
  id: string;
  dueDate: string;
  amount: number;
  cycleYear: number;
  cycleLabel: string;
  installmentNumber: number;
  totalInstallments: number;
  description: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  // Campos legados para compatibilidade
  ano?: number;
  numeroParcela?: number;
  descricao?: string;
  percentual?: number;
}

export interface EqualizaExecutionScheduleItem {
  id: string;
  scheduledDate: string;
  description: string;
  yearCycle: number;
  cycleLabel: string;
  stageName: string;
  plotNames: string[];
  status: 'Agendado' | 'Realizado' | 'Cancelado';
  createdAt: string;
}

export interface EqualizaParams {
  totalAlqueires: number;
  percentualAnualAP: number; // e.g., 0.33 for 33%
  incluirFolha?: boolean;
  incluirFungoNema?: boolean;
  incluirCompactacao?: boolean;
  descontoManual?: number; // e.g., 98
}

export interface EqualizaCalculationResult {
  totalAnualContrato: number;
  totalPeriodoContrato: number;
  precoPorAlqueireAnual: number;
  anosContrato: number;
  parcelaAgosto: number;
  parcelaMarco: number;
  parcelaMensal: number;
  details: {
    custoUnitarioAP: number;
    custoUnitarioConferencia: number;
    custoUnitarioFolha: number;
    custoUnitarioFungoNema: number;
    custoUnitarioCompactacao: number;
    subtotalSemDesconto: number;
    temDescontoAreaMaior100: boolean;
    descontoManual: number;
  };
}

export class EqualizaService {
  private costVariables: Map<string, number>;

  constructor(costVariables: CostVariable[]) {
    this.costVariables = new Map(
      costVariables.map((variable) => [variable.code, Number(variable.value) || 0])
    );
  }

  public getVariableValue(code: string): number {
    const value = this.costVariables.get(code);
    return value === undefined ? 0 : value;
  }

  private getVar(code: string, fallback: number): number {
    return this.costVariables.has(code) ? this.costVariables.get(code)! : fallback;
  }

  public calculate(params: EqualizaParams): EqualizaCalculationResult {
    const {
      totalAlqueires,
      percentualAnualAP,
      incluirFolha = false,
      incluirFungoNema = false,
      incluirCompactacao = false,
      descontoManual = 0,
    } = params;

    // Excel: K32: INT(1 / H33) -> Contract years (e.g. 1 / 0.33 = 3 years)
    const anosContrato = percentualAnualAP > 0 ? Math.floor(1 / percentualAnualAP) : 1;

    // Percentage for Conferencia = 1 - AP
    const percentualAnualConf = Math.max(0, 1 - percentualAnualAP);

    // Annual inflation / escalation factor: (1 + (escalonamentoRate * (anosContrato - 1)))
    const EQUALIZA_ESCALONAMENTO_ANUAL_PERCENTUAL = this.getVar('EQUALIZA_ESCALONAMENTO_ANUAL_PERCENTUAL', 15.0);
    const escalonamentoFactor = 1 + (EQUALIZA_ESCALONAMENTO_ANUAL_PERCENTUAL / 100) * (anosContrato - 1);

    // Base unit rates from BANCO DE DADOS (AP_ATE_50_ALQ takes priority so edits to AP update Equaliza too)
    const precoBaseAP = this.costVariables.has('AP_ATE_50_ALQ')
      ? this.costVariables.get('AP_ATE_50_ALQ')!
      : this.getVar('TIER_1_AP_PRICE', 345.124551);
    const precoBaseConf = this.getVar('VALOR_ALQ_CONFERENCIA', 71.666667); // N4 in Excel
    const precoBaseFolha = this.getVar('VALOR_ALQ_FOLHA', 18); // N10 in Excel
    const precoBaseCompactacao = this.getVar('VALOR_PONTO_CONFERE_COMPACTACAO', 361.111111); // B8 in Excel

    const EQUALIZA_FATOR_CONFERENCIA = this.getVar('EQUALIZA_FATOR_CONFERENCIA', 8.0);
    const EQUALIZA_FATOR_FOLHA = this.getVar('EQUALIZA_FATOR_FOLHA', 0.10);
    const EQUALIZA_CUSTO_FUNGO_NEMA = this.getVar('EQUALIZA_CUSTO_FUNGO_NEMA', 30.00);

    // H23 in BANCO DE DADOS:
    // =$N$7*EQUALIZA!H33 + 'BANCO DE DADOS'!$N$7*EQUALIZA!H34*(1+(15%*(EQUALIZA!$K$32-1)))
    const custoUnitarioAP = Math.round(
      percentualAnualAP * (precoBaseAP * percentualAnualAP + precoBaseAP * percentualAnualConf * escalonamentoFactor)
    );

    // H24 in BANCO DE DADOS:
    const custoUnitarioConferencia = Math.round(
      percentualAnualConf *
        (precoBaseConf * EQUALIZA_FATOR_CONFERENCIA * percentualAnualAP +
          precoBaseConf * EQUALIZA_FATOR_CONFERENCIA * percentualAnualConf * escalonamentoFactor)
    );

    const custoUnitarioFolha = incluirFolha
      ? Math.round(precoBaseFolha * EQUALIZA_FATOR_FOLHA)
      : 0;

    const custoUnitarioFungoNema = incluirFungoNema ? EQUALIZA_CUSTO_FUNGO_NEMA : 0;

    const custoUnitarioCompactacao = incluirCompactacao
      ? Math.round((precoBaseCompactacao / 10) * percentualAnualAP + (precoBaseCompactacao / 10) * percentualAnualConf * escalonamentoFactor)
      : 0;

    const somaUnitarios =
      custoUnitarioAP +
      custoUnitarioConferencia +
      custoUnitarioFolha +
      custoUnitarioFungoNema +
      custoUnitarioCompactacao;

    // Conforme planilha Equaliza (budget.xlsm / LucasRafael.xlsm):
    // EQUALIZA!I41 = IF(B41>=100, SUM(I33:I37)*0.95, SUM(I33:I37))
    const temDescontoAreaMaior100 = totalAlqueires >= 100;
    const precoPorAlqueireAnual = temDescontoAreaMaior100
      ? Math.round(somaUnitarios * 0.95 * 100) / 100
      : somaUnitarios;

    const subtotalAnual = precoPorAlqueireAnual * totalAlqueires;
    const totalAnualContrato = Math.max(0, subtotalAnual - descontoManual);
    const totalPeriodoContrato = totalAnualContrato * anosContrato;

    const parcelaAgosto = totalAnualContrato * 0.5;
    const parcelaMarco = totalAnualContrato * 0.5;
    const parcelaMensal = totalAnualContrato / 12;

    return {
      totalAnualContrato,
      totalPeriodoContrato,
      precoPorAlqueireAnual,
      anosContrato,
      parcelaAgosto,
      parcelaMarco,
      parcelaMensal,
      details: {
        custoUnitarioAP,
        custoUnitarioConferencia,
        custoUnitarioFolha,
        custoUnitarioFungoNema,
        custoUnitarioCompactacao,
        subtotalSemDesconto: somaUnitarios * totalAlqueires,
        temDescontoAreaMaior100,
        descontoManual,
      },
    };
  }

  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  public getAutoPlannedDates(anosContrato: number, baseDate: Date = new Date()) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseYear = baseDate.getFullYear();
    const payments: Array<{
      ano: number;
      numeroParcela: number;
      descricao: string;
      dueDate: string;
      percentual: number;
    }> = [];

    // Checa se 30/08 do ano base já está no passado em relação a hoje
    const augBase = new Date(baseYear, 7, 30);
    const isAugPast = augBase < today;

    let pNum = 1;
    for (let yr = 1; yr <= anosContrato; yr++) {
      const yearOffset = yr - 1;

      if (!isAugPast) {
        // Sequência normal: Agosto do ano base + offset -> Março do próximo ano
        const augYear = baseYear + yearOffset;
        const marYear = augYear + 1;

        payments.push({
          ano: yr,
          numeroParcela: pNum++,
          descricao: `Ano ${yr} - Parcela 50% Agosto`,
          dueDate: `${augYear}-08-30`,
          percentual: 50,
        });
        payments.push({
          ano: yr,
          numeroParcela: pNum++,
          descricao: `Ano ${yr} - Parcela 50% Março`,
          dueDate: `${marYear}-03-30`,
          percentual: 50,
        });
      } else {
        // Se Agosto do ano base já passou, o primeiro vencimento futuro do ciclo é Março do próximo ano,
        // seguido por Agosto do mesmo próximo ano (sempre datas futuras)
        const marYear = baseYear + 1 + yearOffset;
        const augYear = baseYear + 1 + yearOffset;

        payments.push({
          ano: yr,
          numeroParcela: pNum++,
          descricao: `Ano ${yr} - Parcela 50% Março`,
          dueDate: `${marYear}-03-30`,
          percentual: 50,
        });
        payments.push({
          ano: yr,
          numeroParcela: pNum++,
          descricao: `Ano ${yr} - Parcela 50% Agosto`,
          dueDate: `${augYear}-08-30`,
          percentual: 50,
        });
      }
    }

    const firstDueDate = payments[0]?.dueDate || `${baseYear}-08-30`;

    return {
      firstDueDate,
      payments,
    };
  }

  public generatePaymentSchedules(
    anosContrato: number,
    totalAnualContrato: number,
    baseDate: Date = new Date(),
    mode: EqualizaPaymentPlanMode = 'semestral'
  ): EqualizaPaymentItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseYear = baseDate.getFullYear();
    const augBase = new Date(baseYear, 7, 30);
    const isAugPast = augBase < today;

    const rawItems: Array<{
      cycleYear: number;
      cycleLabel: string;
      description: string;
      dueDate: string;
      amount: number;
      percentual: number;
    }> = [];

    for (let yr = 1; yr <= anosContrato; yr++) {
      const yearOffset = yr - 1;
      const cycleYearStart = isAugPast ? baseYear + 1 + yearOffset : baseYear + yearOffset;
      const cycleLabel = `Ano ${yr} (Safra ${cycleYearStart}/${cycleYearStart + 1})`;

      if (mode === 'anual') {
        const dueYear = isAugPast ? baseYear + 1 + yearOffset : baseYear + yearOffset + 1;
        rawItems.push({
          cycleYear: yr,
          cycleLabel,
          description: `Ano ${yr} - Parcela Única Safra`,
          dueDate: `${dueYear}-03-30`,
          amount: Math.round(totalAnualContrato * 100) / 100,
          percentual: 100,
        });
      } else if (mode === 'trimestral') {
        const quarterAmt = Math.round((totalAnualContrato / 4) * 100) / 100;
        const remainder = Math.round((totalAnualContrato - quarterAmt * 4) * 100) / 100;
        const dates = isAugPast
          ? [
              { label: 'Março', date: `${baseYear + 1 + yearOffset}-03-30` },
              { label: 'Junho', date: `${baseYear + 1 + yearOffset}-06-30` },
              { label: 'Setembro', date: `${baseYear + 1 + yearOffset}-09-30` },
              { label: 'Dezembro', date: `${baseYear + 1 + yearOffset}-12-30` },
            ]
          : [
              { label: 'Agosto', date: `${baseYear + yearOffset}-08-30` },
              { label: 'Novembro', date: `${baseYear + yearOffset}-11-30` },
              { label: 'Fevereiro', date: `${baseYear + yearOffset + 1}-02-28` },
              { label: 'Maio', date: `${baseYear + yearOffset + 1}-05-30` },
            ];

        dates.forEach((d, idx) => {
          rawItems.push({
            cycleYear: yr,
            cycleLabel,
            description: `Ano ${yr} - Trimestral (${d.label})`,
            dueDate: d.date,
            amount: idx === dates.length - 1 ? Math.round((quarterAmt + remainder) * 100) / 100 : quarterAmt,
            percentual: 25,
          });
        });
      } else {
        // Semestral padrão (Agosto e Março - 50% / 50%)
        const halfAmt = Math.round((totalAnualContrato * 0.5) * 100) / 100;
        const secondHalf = Math.round((totalAnualContrato - halfAmt) * 100) / 100;

        if (!isAugPast) {
          const augYear = baseYear + yearOffset;
          const marYear = augYear + 1;
          rawItems.push({
            cycleYear: yr,
            cycleLabel,
            description: `Ano ${yr} - Parcela 50% Agosto`,
            dueDate: `${augYear}-08-30`,
            amount: halfAmt,
            percentual: 50,
          });
          rawItems.push({
            cycleYear: yr,
            cycleLabel,
            description: `Ano ${yr} - Parcela 50% Março`,
            dueDate: `${marYear}-03-30`,
            amount: secondHalf,
            percentual: 50,
          });
        } else {
          const refYear = baseYear + 1 + yearOffset;
          rawItems.push({
            cycleYear: yr,
            cycleLabel,
            description: `Ano ${yr} - Parcela 50% Março`,
            dueDate: `${refYear}-03-30`,
            amount: halfAmt,
            percentual: 50,
          });
          rawItems.push({
            cycleYear: yr,
            cycleLabel,
            description: `Ano ${yr} - Parcela 50% Agosto`,
            dueDate: `${refYear}-08-30`,
            amount: secondHalf,
            percentual: 50,
          });
        }
      }
    }

    const totalInstallments = rawItems.length;
    return rawItems.map((item, idx) => ({
      id: generateUUID(),
      dueDate: item.dueDate,
      amount: item.amount,
      cycleYear: item.cycleYear,
      cycleLabel: item.cycleLabel,
      installmentNumber: idx + 1,
      totalInstallments,
      description: item.description,
      status: 'Pendente' as const,
      ano: item.cycleYear,
      numeroParcela: idx + 1,
      descricao: item.description,
      percentual: item.percentual,
    }));
  }

  public generateSuggestedSchedules(
    anosContrato: number,
    yearAllocations: Array<{ ano: number; plotNames: string[] }>,
    options: { incluirFolha?: boolean; incluirCompactacao?: boolean } = {},
    baseDate: Date = new Date()
  ): EqualizaExecutionScheduleItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseYear = baseDate.getFullYear();
    const augBase = new Date(baseYear, 7, 15);
    const isAugPast = augBase < today;
    const nowIso = new Date().toISOString();

    const schedules: EqualizaExecutionScheduleItem[] = [];

    for (let yr = 1; yr <= anosContrato; yr++) {
      const yearOffset = yr - 1;
      const currentCycleYear = isAugPast ? baseYear + 1 + yearOffset : baseYear + yearOffset;
      const cycleLabel = `Ano ${yr} (Safra ${currentCycleYear}/${currentCycleYear + 1})`;
      const alloc = yearAllocations.find((a) => a.ano === yr);
      const apPlots = alloc?.plotNames || [];

      // 1. Amostragem em Grid (AP)
      schedules.push({
        id: generateUUID(),
        scheduledDate: `${currentCycleYear}-08-15`,
        description: `Amostragem de Solo em Grid (AP) - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Amostragem de Solo em Grid (AP)',
        plotNames: apPlots,
        status: 'Agendado',
        createdAt: nowIso,
      });

      // 2. Amostragem de Conferência
      schedules.push({
        id: generateUUID(),
        scheduledDate: `${currentCycleYear}-09-10`,
        description: `Conferência de Solo nos demais talhões - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Conferência de Solo',
        plotNames: [],
        status: 'Agendado',
        createdAt: nowIso,
      });

      // 3. Compactação (se incluída)
      if (options.incluirCompactacao) {
        schedules.push({
          id: generateUUID(),
          scheduledDate: `${currentCycleYear}-10-05`,
          description: `Avaliação de Compactação do Solo - ${cycleLabel}`,
          yearCycle: yr,
          cycleLabel,
          stageName: 'Compactação de Solo',
          plotNames: apPlots,
          status: 'Agendado',
          createdAt: nowIso,
        });
      }

      // 4. Análise Foliar (se incluída)
      if (options.incluirFolha) {
        schedules.push({
          id: generateUUID(),
          scheduledDate: `${currentCycleYear + 1}-01-15`,
          description: `Coleta Foliar (Safra) - ${cycleLabel}`,
          yearCycle: yr,
          cycleLabel,
          stageName: 'Coleta Foliar (Safra)',
          plotNames: apPlots,
          status: 'Agendado',
          createdAt: nowIso,
        });
      }

      // 5. Apresentação e Devolutiva
      schedules.push({
        id: generateUUID(),
        scheduledDate: `${currentCycleYear + 1}-03-05`,
        description: `Devolutiva e Apresentação de Mapas - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Reunião de Devolutiva / Apresentação de Mapas',
        plotNames: apPlots,
        status: 'Agendado',
        createdAt: nowIso,
      });
    }

    return schedules;
  }
}

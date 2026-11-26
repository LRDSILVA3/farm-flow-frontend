import { CostVariable } from './ConferenciaService';

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
    const currentMonth = baseDate.getMonth() + 1;
    const currentYear = baseDate.getFullYear();

    let firstDueDateYear = currentYear;
    let firstDueDateMonth = 8;

    if (currentMonth > 8) {
      firstDueDateYear = currentYear + 1;
      firstDueDateMonth = 3;
    } else if (currentMonth <= 2) {
      firstDueDateYear = currentYear;
      firstDueDateMonth = 3;
    } else {
      firstDueDateYear = currentYear;
      firstDueDateMonth = 8;
    }

    const payments: Array<{
      ano: number;
      numeroParcela: number;
      descricao: string;
      dueDate: string;
      percentual: number;
    }> = [];

    let pNum = 1;
    for (let yr = 1; yr <= anosContrato; yr++) {
      const yearOffset = yr - 1;
      const refYear = currentYear + yearOffset;
      payments.push({
        ano: yr,
        numeroParcela: pNum++,
        descricao: `Ano ${yr} - Parcela 50% Agosto`,
        dueDate: `${refYear}-08-30`,
        percentual: 50,
      });
      payments.push({
        ano: yr,
        numeroParcela: pNum++,
        descricao: `Ano ${yr} - Parcela 50% Março`,
        dueDate: `${refYear + 1}-03-30`,
        percentual: 50,
      });
    }

    return {
      firstDueDate: `${firstDueDateYear}-${String(firstDueDateMonth).padStart(2, '0')}-30`,
      payments,
    };
  }

  public generateSuggestedSchedules(
    anosContrato: number,
    yearAllocations: Array<{ ano: number; plotNames: string[] }>,
    options: { incluirFolha?: boolean; incluirCompactacao?: boolean } = {},
    baseDate: Date = new Date()
  ) {
    const baseYear = baseDate.getFullYear();
    const schedules: Array<{
      scheduledDate: string;
      description: string;
      yearCycle: number;
      cycleLabel: string;
      stageName: string;
      plotNames: string[];
    }> = [];

    for (let yr = 1; yr <= anosContrato; yr++) {
      const currentCycleYear = baseYear + (yr - 1);
      const cycleLabel = `Ano ${yr} (Safra ${currentCycleYear}/${currentCycleYear + 1})`;
      const alloc = yearAllocations.find((a) => a.ano === yr);
      const apPlots = alloc?.plotNames || [];

      // 1. Amostragem em Grid (AP)
      schedules.push({
        scheduledDate: `${currentCycleYear}-08-15`,
        description: `Amostragem de Solo em Grid (AP) - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Amostragem de Solo em Grid (AP)',
        plotNames: apPlots,
      });

      // 2. Amostragem de Conferência
      schedules.push({
        scheduledDate: `${currentCycleYear}-09-10`,
        description: `Conferência de Solo nos demais talhões - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Conferência de Solo',
        plotNames: [],
      });

      // 3. Compactação (se incluída)
      if (options.incluirCompactacao) {
        schedules.push({
          scheduledDate: `${currentCycleYear}-10-05`,
          description: `Avaliação de Compactação do Solo - ${cycleLabel}`,
          yearCycle: yr,
          cycleLabel,
          stageName: 'Compactação de Solo',
          plotNames: apPlots,
        });
      }

      // 4. Análise Foliar (se incluída)
      if (options.incluirFolha) {
        schedules.push({
          scheduledDate: `${currentCycleYear + 1}-01-15`,
          description: `Coleta Foliar (Safra) - ${cycleLabel}`,
          yearCycle: yr,
          cycleLabel,
          stageName: 'Coleta Foliar (Safra)',
          plotNames: apPlots,
        });
      }

      // 5. Apresentação e Devolutiva
      schedules.push({
        scheduledDate: `${currentCycleYear + 1}-03-05`,
        description: `Devolutiva e Apresentação de Mapas - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Reunião de Devolutiva / Apresentação de Mapas',
        plotNames: apPlots,
      });
    }

    return schedules;
  }
}

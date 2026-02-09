import { differenceInDays } from 'date-fns';

interface ConferenciaParams {
  clienteDesejaNotaFiscal: 'S' | 'N';
  distanciaFazendaKm: number;
  vencimentoServico: string; // Expects DD/MM/YYYY format
  desejaAnaliseFisica: 'S' | 'N';
  percentualAnalises20_40cm: number;
  alqueires: number;
  numAnalises: number;
}

export interface CostVariable {
  id: string;
  name: string;
  code: string;
  value: number;
  description: string;
}

export class ConferenciaService {
  private costVariables: Map<string, number>;

  constructor(costVariables: CostVariable[]) {
    this.costVariables = new Map(
      costVariables.map((variable) => [variable.code, variable.value])
    );
  }

  private getVariableValue(code: string): number {
    const value = this.costVariables.get(code);
    if (value === undefined) {
      // In a real-world scenario, you might want to log this error
      // or handle it more gracefully, e.g., by returning a default value.
      console.error(`Cost variable with code "${code}" not found.`);
      return 0; // Return 0 or throw an error, depending on desired behavior
    }
    return value;
  }

  public calculate(params: ConferenciaParams): { totalValue: number; details: any } {
    const {
      distanciaFazendaKm,
      vencimentoServico,
      desejaAnaliseFisica,
      percentualAnalises20_40cm,
      alqueires,
      numAnalises,
    } = params;

    const VALOR_ALQ_CONFERENCIA = this.getVariableValue('VALOR_ALQ_CONFERENCIA');
    const VALOR_KM_CONFERENCIA_FOLHA = this.getVariableValue('VALOR_KM_CONFERENCIA_FOLHA');
    const VALOR_PONTO_CONFERE_COMPACTACAO = this.getVariableValue('VALOR_PONTO_CONFERE_COMPACTACAO');
    const JUROS_PAGAMENTO_PRAZO_PERCENTUAL = this.getVariableValue('JUROS_PAGAMENTO_PRAZO_PERCENTUAL');
    const ANALISE_FISICA_CUSTO_ADICIONAL = this.getVariableValue('ANALISE_FISICA_CUSTO_ADICIONAL');
    const ANALISE_20_40_CM_VALOR_ANALISE = this.getVariableValue('ANALISE_20_40_CM_VALOR_ANALISE');
    const ANALISE_MACRO_VALOR_ANALISE = this.getVariableValue('ANALISE_MACRO_VALOR_ANALISE');
    
    const today = new Date();
    const [day, month, year] = vencimentoServico.split('/').map(Number);
    const vencimentoServicoDate = new Date(year, month - 1, day);

    const daysDifference = differenceInDays(vencimentoServicoDate, today);
    const jurosFactor =
      daysDifference > 0
        ? Math.pow(
            (JUROS_PAGAMENTO_PRAZO_PERCENTUAL / 100 + 1),
            daysDifference / 30
          )
        : 1;

    const custoAnaliseFisica =
      desejaAnaliseFisica === 'S'
        ? ANALISE_FISICA_CUSTO_ADICIONAL + ANALISE_20_40_CM_VALOR_ANALISE
        : ANALISE_FISICA_CUSTO_ADICIONAL;

    let selectedCostMethod = 0;
    let reCalcCostMethod1 = 0;
    let reCalcCostMethod2 = 0;

    if (alqueires > 0) {
      reCalcCostMethod1 =
        alqueires * VALOR_ALQ_CONFERENCIA + VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm;
      reCalcCostMethod2 =
        numAnalises * VALOR_PONTO_CONFERE_COMPACTACAO +
        (VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm / alqueires) * numAnalises;
      
      selectedCostMethod = Math.max(reCalcCostMethod1, reCalcCostMethod2);
    }
    
    const custoTalhaoCalculated = selectedCostMethod * jurosFactor;

    const partF30Factor1 =
      percentualAnalises20_40cm > 0
        ? numAnalises * (percentualAnalises20_40cm / 100) <= 1
          ? 1
          : Math.round(numAnalises * (percentualAnalises20_40cm / 100))
        : 0;

    const partF30Factor2 = ANALISE_MACRO_VALOR_ANALISE + VALOR_ALQ_CONFERENCIA;
    const valueF30 = partF30Factor1 * partF30Factor2;

    const totalValue = custoTalhaoCalculated + valueF30;

    return {
      totalValue,
      details: {
        jurosFactor,
        custoAnaliseFisica,
        costMethod1: reCalcCostMethod1,
        costMethod2: reCalcCostMethod2,
        custoTalhaoCalculated,
        valueF30,
      },
    };
  }

  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}

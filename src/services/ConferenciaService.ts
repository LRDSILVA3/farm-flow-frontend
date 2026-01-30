import { differenceInDays, parseISO } from 'date-fns';

interface ConferenciaParams {
  clienteDesejaNotaFiscal: 'S' | 'N';
  distanciaFazendaKm: number;
  vencimentoServico: string; // DD/MM/AA format, will be parsed
  desejaAnaliseFisica: 'S' | 'N';
  percentualAnalises20_40cm: number;
  alqueires: number; // Area in alqueires for the plot
  numAnalises: number; // Number of analyses for the plot
}

export class ConferenciaService {
  // Constants from database.CSV (BANCO DE DADOS)
  private readonly VALOR_ALQ_CONFERENCIA: number = 65.00; // B10
  private readonly VALOR_KM_CONFERENCIA_FOLHA: number = 4.96; // B12
  private readonly VALOR_PONTO_CONFERE_COMPACTACAO: number = 430.00; // B8
  private readonly JUROS_PAGAMENTO_PRAZO_PERCENTUAL: number = 0.015; // B40 (1.5% as 0.015)
  private readonly JUROS_FATOR: number = 1.06; // C1

  // Constants from input_dados.CSV (INPUT DADOS)
  private readonly ANALISE_FISICA_CUSTO_SUM_D3_D5: number = 105.30; // SUM(D3:D5) in input_dados.CSV
  private readonly ANALISE_20_40_CM_VALOR_ANALISE: number = 70.00; // C23
  private readonly ANALISE_MACRO_VALOR_ANALISE: number = 52.30; // C22

  constructor() {
    // In a real application, these constants would be fetched from a database
    // and potentially be dynamic. For now, they are hardcoded based on the CSVs.
  }

  /**
   * Calculates the final value for the "Conferência" service.
   * @param params - Parameters for the calculation.
   * @returns The calculated total value.
   */
  public calculate(params: ConferenciaParams): { totalValue: number; details: any } {
    const {
      clienteDesejaNotaFiscal,
      distanciaFazendaKm,
      vencimentoServico,
      desejaAnaliseFisica,
      percentualAnalises20_40cm,
      alqueires,
      numAnalises,
    } = params;

    // Parse date for interest calculation
    const today = new Date();
    // Assuming vencimentoServico is DD/MM/AAAA, converting to ISO for parseISO
    const [day, month, year] = vencimentoServico.split('/').map(Number);
    const vencimentoServicoDate = new Date(year, month - 1, day);

    // F5: Juros Calculation (from conferencia_service_formulas.CSV)
    // "SE(DIAS(E5;G4)>0;(POTÊNCIA(('BANCO DE DADOS'!B40+100)/100;(DIAS(E5;G4)/30)));1)"
    // E5 is vencimentoServicoDate, G4 is today
    const daysDifference = differenceInDays(vencimentoServicoDate, today);
    const jurosFactor = daysDifference > 0
      ? Math.pow(((this.JUROS_PAGAMENTO_PRAZO_PERCENTUAL * 100 + 100) / 100), (daysDifference / 30))
      : 1;

    // F6: Análise Física / Adicional (from conferencia_service_formulas.CSV)
    // "SE(E6=""S"";SOMA('INPUT DADOS'!D3:D5;'INPUT DADOS'!C24);SOMA('INPUT DADOS'!D3:D5))"
    // E6 is desejaAnaliseFisica
    const custoAnaliseFisica = desejaAnaliseFisica === 'S'
      ? (this.ANALISE_FISICA_CUSTO_SUM_D3_D5 + this.ANALISE_20_40_CM_VALOR_ANALISE)
      : this.ANALISE_FISICA_CUSTO_SUM_D3_D5; // This seems to be a fixed sum if no physical analysis is desired, which might be a misunderstanding of the original Excel logic. Recheck if needed.

    // Calculation Method 1: Based on Alqueires
    // alqueires * VALOR_ALQ_CONFERENCIA + (VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm / alqueires * alqueires)
    // B29 is the total alqueires for the entire work, here it's alqueires of the plot
    const costMethod1 = (alqueires * this.VALOR_ALQ_CONFERENCIA) +
                       (this.VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm); // Simplified, assuming B29 / B29 cancels out if B29 is alqueires

    // Calculation Method 2: Based on Number of Analyses
    // numAnalises * VALOR_PONTO_CONFERE_COMPACTACAO + (VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm / alqueires * numAnalises)
    // Here, if B29 is alqueires, and the logic is for cost per analysis, the formula needs careful review.
    // Assuming the original intent from Excel was for B29 to be a constant total alqueires for the *order*,
    // but the user clarified B29 as the current plot's alqueires. This simplifies significantly.
    const costMethod2 = (numAnalises * this.VALOR_PONTO_CONFERE_COMPACTACAO) +
                       ((this.VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm / alqueires) * numAnalises);

    // E9 (R$ / Talhão) calculation (from conferencia_service_formulas.CSV)
    // "SE(B9>0;SE((B9*'BANCO DE DADOS'!$B$10+('BANCO DE DADOS'!$B$12*$E$4/$B$29*B9))<(C9*'BANCO DE DADOS'!$B$8+('BANCO DE DADOS'!$B$12*$E$4/$B$29*B9));(C9*'BANCO DE DADOS'!$B$8+('BANCO DE DADOS'!$B$12*$E$4/$B$29*B9));(B9*'BANCO DE DADOS'!$B$10+('BANCO DE DADOS'!$B$12*$E$4/$B$29*B9)));0)*$F$5"
    // B9 is alqueires, C9 is numAnalises, E4 is distanciaFazendaKm
    // Let's re-implement E9 based on a direct translation of the original Excel logic with updated B29:
    let selectedCostMethod = 0;
    let reCalcCostMethod1 = 0; // Declare outside if block
    let reCalcCostMethod2 = 0; // Declare outside if block

    if (alqueires > 0) {
      // Re-calculate method1 and method2 with the clarified B29 (as alqueires)
      reCalcCostMethod1 = (alqueires * this.VALOR_ALQ_CONFERENCIA) +
                                (this.VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm); // B29/B29 cancels out
      reCalcCostMethod2 = (numAnalises * this.VALOR_PONTO_CONFERE_COMPACTACAO) +
                               ((this.VALOR_KM_CONFERENCIA_FOLHA * distanciaFazendaKm / alqueires) * numAnalises);

      if (reCalcCostMethod1 < reCalcCostMethod2) {
        selectedCostMethod = reCalcCostMethod2;
      } else {
        selectedCostMethod = reCalcCostMethod1;
      }
    }
    const custoTalhaoCalculated = selectedCostMethod * jurosFactor;


    // E30 (VALOR TOTAL DO TRABALHO) from conferencia_service_formulas.CSV
    // "SOMA(E9:E28)+F30"
    // Assuming E9 is the cost for THIS plot, and E28 implies summing all plots.
    // F30 in conferencia_service_formulas.CSV is:
    // "SE('INPUT CONFERENCIA'!E7>0;SE('INPUT CONFERENCIA'!C29*'INPUT CONFERENCIA'!E7<=1;1;ARRED('INPUT CONFERENCIA'!E7*'INPUT CONFERENCIA'!C29;0));0)*('INPUT DADOS'!C23+'BANCO DE DADOS'!B10)"
    // 'INPUT CONFERENCIA'!E7 is percentualAnalises20_40cm
    // 'INPUT CONFERENCIA'!C29 is numAnalises
    // 'INPUT DADOS'!C23 is ANALISE_MACRO_VALOR_ANALISE (52.30)
    // 'BANCO DE DADOS'!B10 is VALOR_ALQ_CONFERENCIA (65.00)

    const partF30Factor1 = percentualAnalises20_40cm > 0
      ? (numAnalises * (percentualAnalises20_40cm / 100) <= 1
        ? 1
        : Math.round(numAnalises * (percentualAnalises20_40cm / 100)))
      : 0;
    
    const partF30Factor2 = this.ANALISE_MACRO_VALOR_ANALISE + this.VALOR_ALQ_CONFERENCIA;
    const valueF30 = partF30Factor1 * partF30Factor2;

    // Total value for this plot. Assuming E9:E28 refers to summing up all plots,
    // for a single plot calculation, it's just this plot's value.
    const totalValue = custoTalhaoCalculated + valueF30;

    return {
      totalValue,
      details: {
        jurosFactor,
        custoAnaliseFisica,
        costMethod1: reCalcCostMethod1, // Use re-calculated values for details
        costMethod2: reCalcCostMethod2, // Use re-calculated values for details
        custoTalhaoCalculated,
        valueF30,
        // Add more details for debugging if needed
      }
    };
  }

  // Helper to format numbers to Brazilian currency string (optional)
  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}

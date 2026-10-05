-- Add new cost variables for ConferenciaService
INSERT INTO public.cost_variables (name, code, value, description)
VALUES
  ('Data Base Calculo Juro', 'DATA_BASE_CALCULO_JURO', 20241231, 'Data base para cálculo de juro (YYYYMMDD)'),
  ('Valor Analise Nova Area', 'VALOR_ANALISE_NOVA_AREA', 52.30, 'Valor referente à Nova Área (INPUT DADOS!D3)'),
  ('Valor Analise Adubo Base', 'VALOR_ANALISE_ADUBO_BASE', 35.30, 'Valor referente ao Adubo de Base (INPUT DADOS!D4)'),
  ('Valor Analise Enxofre', 'VALOR_ANALISE_ENXOFRE', 17.70, 'Valor referente ao Enxofre (INPUT DADOS!D5)'),
  ('Valor Analise Fisica Unitario', 'VALOR_ANALISE_FISICA_UNITARIO', 42.30, 'Valor unitário para Análise Física (INPUT DADOS!C24)'),
  ('Valor Analise Micronutrientes', 'VALOR_ANALISE_MICRONUTRIENTES', 20.00, 'Valor referente aos Micronutrientes (INPUT DADOS!D6)'),
  ('Valor Analise Completa Unitario', 'VALOR_ANALISE_COMPLETA_UNITARIO', 125.30, 'Valor unitário para Análise Completa (INPUT DADOS!C23)')
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    value = EXCLUDED.value,
    description = EXCLUDED.description;

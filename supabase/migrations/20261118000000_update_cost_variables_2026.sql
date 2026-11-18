-- Migration: Update Cost Variables and System Services to 2026 Official Spreadsheet (LucasRafael.xlsm)

-- 1. Insert or update all cost variables from 2026 LucasRafael.xlsm
INSERT INTO public.cost_variables (name, code, value, description)
VALUES
  -- Combustível & Logística
  ('Valor Oleo Diesel', 'VALOR_OLEO_DIESEL', 8.375, 'Valor do Oleo Diesel (R$/Lt) - BANCO DE DADOS!B25'),
  ('Valor Diesel Padrão', 'VALOR_DIESEL', 8.38, 'Valor de referência Diesel'),
  ('Valor Km Frete', 'VALOR_KM_FRETE', 17.82, 'Valor do Km Frete caminhão carregado - BANCO DE DADOS!B21'),
  ('Valor Km Deslocamento', 'VALOR_KM_DESLOCAMENTO', 7.39, 'Valor do Km Deslocamento caminhão vazio - BANCO DE DADOS!B22'),
  ('Valor Km Deslocamento Caminhao Vazio', 'VALOR_KM_DESLOCAMENTO_VAZIO', 7.39, 'Valor por km de deslocamento do caminhão vazio - BANCO DE DADOS!B22'),
  ('Valor Km Deslocamento Prancha', 'VALOR_KM_DESLOCAMENTO_PRANCHA', 13.00, 'Valor do Km deslocamento caminhao prancha - BANCO DE DADOS!B28'),
  ('Valor KM Conferencia Folha', 'VALOR_KM_CONFERENCIA_FOLHA', 4.785714, 'Valor por KM para conferencia de folha - BANCO DE DADOS!B12'),
  ('Valor KM Conferencia Folha Calculado', 'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO', 4.785714, 'Valor calculado KM conferencia folha'),

  -- Conferência
  ('Valor Alqueire Conferencia', 'VALOR_ALQ_CONFERENCIA', 71.666667, 'Valor por alqueire para o serviço de conferencia - BANCO DE DADOS!B10'),
  ('Valor Ponto Confere Compactacao', 'VALOR_PONTO_CONFERE_COMPACTACAO', 361.111111, 'Valor por ponto de conferencia de compactacao - BANCO DE DADOS!B8'),
  ('Valor Viagem Conferencia Folha', 'VALOR_VIAGEM_CONFERENCIA_FOLHA', 366.666667, 'Valor por viagem para conferencia de folha - BANCO DE DADOS!B13'),

  -- Financeiro & Prazos
  ('Juros Pagamento Prazo Percentual', 'JUROS_PAGAMENTO_PRAZO_PERCENTUAL', 1.20, 'Percentual de juros para pagamento a prazo - BANCO DE DADOS!B40'),
  ('Data Base Calculo Juro', 'DATA_BASE_CALCULO_JURO', 20251231, 'Data base para cálculo de juros (YYYYMMDD = 46022 = 31/12/2025)'),
  ('Data Base Calculo Juro Drone', 'DATA_BASE_CALCULO_JURO_DRONE', 20251231, 'Data base para cálculo de juro drone (PEDIDO DRONE M31 = 46022 = 31/12/2025)'),
  ('Prazo Máximo Data Base', 'PRAZO_MAXIMO_DATA', 20261230, 'Prazo máximo data YYYYMMDD (BANCO DE DADOS!B37 = 46386 = 30/12/2026)'),

  -- Laboratório & Análises de Solo
  ('Analise 20-40 CM Valor Analise', 'ANALISE_20_40_CM_VALOR_ANALISE', 73.90, 'Valor da análise de 20-40 cm - INPUT DADOS!C23'),
  ('Valor Analise Nova Area', 'VALOR_ANALISE_NOVA_AREA', 61.40, 'Valor análise de nova área / Adubação Corretiva - INPUT DADOS!D3'),
  ('Valor Analise Adubo Base', 'VALOR_ANALISE_ADUBO_BASE', 17.50, 'Valor análise de adubo base - INPUT DADOS!D4'),
  ('Valor Analise Enxofre', 'VALOR_ANALISE_ENXOFRE', 12.50, 'Valor análise de enxofre - INPUT DADOS!D5'),
  ('Valor Analise Micronutrientes', 'VALOR_ANALISE_MICRONUTRIENTES', 29.55, 'Valor análise de micronutrientes - INPUT DADOS!D6'),
  ('Valor Analise Fisica Unitario', 'VALOR_ANALISE_FISICA_UNITARIO', 33.30, 'Valor análise física unitária - INPUT DADOS!C24'),
  ('Analise Macro Valor Analise', 'ANALISE_MACRO_VALOR_ANALISE', 61.40, 'Valor da análise macro - INPUT DADOS!D3'),
  ('Valor Analise Completa Unitario', 'VALOR_ANALISE_COMPLETA_UNITARIO', 91.40, 'Valor análise completa unitária - INPUT DADOS!B7'),
  ('Valor Laboratório BIOAS', 'VALOR_LAB_BIOAS', 205.20, 'Valor laboratório BIOAS (PrimorLab) - BANCO DE DADOS!B48'),

  -- Coleta Foliar
  ('Valor Alqueire Folha', 'VALOR_ALQ_FOLHA', 18.00, 'Valor/Alq folha - BANCO DE DADOS!B9'),
  ('Valor Analise Foliar', 'VALOR_ANALISE_FOLIAR', 90.00, 'Valor da Análise Foliar laboratório - BANCO DE DADOS!B11'),

  -- Aplicação ATV & Equipamentos
  ('Despesa Viagem ATV', 'DESPESA_VIAGEM_ATV', 251.25, 'Despesa/viagem que cobre 5km - BANCO DE DADOS!B19'),
  ('ATV 1 Produto', 'ATV_1_PRODUTO', 315.00, 'Valor/alq ATV para 1 produto - BANCO DE DADOS!B16'),
  ('ATV 2 Produtos', 'ATV_2_PRODUTOS', 310.00, 'Valor/alq ATV para 2 produtos - BANCO DE DADOS!B17'),
  ('ATV 3 ou Mais Produtos', 'ATV_3_PRODUTOS', 300.00, 'Valor/alq ATV para 3 ou mais produtos - BANCO DE DADOS!B18'),
  ('Valor Aplicacao Esterco', 'VALOR_APLICACAO_ESTERCO', 45.00, 'Aplicação Esterco R$/ton - BANCO DE DADOS!B24'),
  ('Diaria Pa Carregadeira', 'DIARIA_PA_CARREGADEIRA', 2400.00, 'Diária da Pá carregadeira - BANCO DE DADOS!B20'),
  ('Hora Pa Carregadeira', 'HORA_PA_CARREGADEIRA', 360.00, 'Valor da hora da pá carregadeira - BANCO DE DADOS!B43'),

  -- Amostragem AP
  ('AP Ate 50 Alqueires', 'AP_ATE_50_ALQ', 345.124551, 'R$/Alq AP até 50 alq - BANCO DE DADOS!B3'),
  ('AP 50 a 100 Alqueires', 'AP_50_A_100_ALQ', 325.589199, 'R$/Alq AP 50 a 100 alq - BANCO DE DADOS!B4'),
  ('AP Mais de 100 Alqueires', 'AP_MAIS_100_ALQ', 307.159622, 'R$/Alq AP mais de 100 alq - BANCO DE DADOS!B5'),
  ('Tier 1 AP Price', 'TIER_1_AP_PRICE', 345.124551, 'Preço base tier 1 AP'),
  ('Reanalise Ate 50 Alqueires', 'REANALISE_ATE_50_ALQ', 330.124551, 'R$/Alq Reanálise até 50 alq - BANCO DE DADOS!C3'),
  ('Reanalise 50 a 100 Alqueires', 'REANALISE_50_A_100_ALQ', 311.438256, 'R$/Alq Reanálise 50 a 100 alq - BANCO DE DADOS!C4'),
  ('Reanalise Mais de 100 Alqueires', 'REANALISE_MAIS_100_ALQ', 293.809675, 'R$/Alq Reanálise mais de 100 alq - BANCO DE DADOS!C5'),
  ('Desconto Sem Formula Adubo', 'DESCONTO_SEM_FORMULA_ADUBO', 0.80, 'Fator de desconto se sem fórmula de adubo - BANCO DE DADOS!B6')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- 2. Atualizar valores de referência por alqueire na tabela de serviços
UPDATE public.services SET value_per_alqueire = '345.12' WHERE name = 'Amostragem de Solo (AP)';
UPDATE public.services SET value_per_alqueire = '71.67' WHERE name = 'Conferência';
UPDATE public.services SET value_per_alqueire = '18.00' WHERE name = 'Coleta Foliar';
UPDATE public.services SET value_per_alqueire = '315.00' WHERE name = 'Aplicação ATV';


-- Migration: Add all cost variables from budget.xlsm (BANCO DE DADOS)
INSERT INTO public.cost_variables (name, code, value, description)
VALUES
  ('Valor Oleo Diesel', 'VALOR_OLEO_DIESEL', 6.941176, 'Valor do Oleo Diesel (R$/Lt) - BANCO DE DADOS!B25'),
  ('Valor Alqueire Folha', 'VALOR_ALQ_FOLHA', 60.00, 'Valor/Alq folha - BANCO DE DADOS!B9'),
  ('Valor Analise Foliar', 'VALOR_ANALISE_FOLIAR', 70.00, 'Valor da Análise Foliar (laboratório) - BANCO DE DADOS!B11'),
  ('Valor Km Frete', 'VALOR_KM_FRETE', 14.77, 'Valor do Km Frete caminhao carregado - BANCO DE DADOS!B21'),
  ('Valor Km Deslocamento', 'VALOR_KM_DESLOCAMENTO', 6.12, 'Valor do Km Deslocamento caminhao vazio - BANCO DE DADOS!B22'),
  ('Despesa Viagem ATV', 'DESPESA_VIAGEM_ATV', 208.24, 'Despesa/viagem que cobre 5km - BANCO DE DADOS!B19'),
  ('ATV 1 Produto', 'ATV_1_PRODUTO', 290.00, 'Valor/alq ATV para 1 produto - BANCO DE DADOS!B16'),
  ('ATV 2 Produtos', 'ATV_2_PRODUTOS', 280.00, 'Valor/alq ATV para 2 produtos - BANCO DE DADOS!B17'),
  ('ATV 3 ou Mais Produtos', 'ATV_3_PRODUTOS', 260.00, 'Valor/alq ATV para 3 ou mais produtos - BANCO DE DADOS!B18'),
  ('Valor Aplicacao Esterco', 'VALOR_APLICACAO_ESTERCO', 40.40, 'Aplicacao Esterco (R$/ton) - BANCO DE DADOS!B24'),
  ('Diaria Pa Carregadeira', 'DIARIA_PA_CARREGADEIRA', 2600.00, 'Diaria da Pa carregadeira - BANCO DE DADOS!B20'),
  ('Hora Pa Carregadeira', 'HORA_PA_CARREGADEIRA', 390.00, 'Valor da hora da pa carregadeira - BANCO DE DADOS!B43'),
  ('Voo Drone Alq Ano', 'VOO_DRONE_ALQ_ANO', 50.00, 'Voo de Drone/Alq/Ano - BANCO DE DADOS!B26'),
  ('Drone Pulverizacao Base Alq', 'DRONE_PULVE_BASE_ALQ', 240.00, 'R$/Alq base calculo pulverizacao drone - BANCO DE DADOS!B34'),
  ('Drone Pulverizacao Preco Minimo Alq', 'DRONE_PULVE_PRECO_MINIMO_ALQ', 270.00, 'Preco minimo/alq pulverizacao drone - BANCO DE DADOS!B35'),
  ('Drone Pulverizacao Preco Programada', 'DRONE_PULVE_PRECO_PROGRAMADA', 240.00, 'Preco se area programada pulverizacao drone - BANCO DE DADOS!B36'),
  ('Drone Valor Obstaculo', 'DRONE_VALOR_OBSTACULO', 100.00, 'R$/obstaculo pulverizacao drone - BANCO DE DADOS!B30'),
  ('Drone Valor Beira Mato', 'DRONE_VALOR_BEIRA_MATO', 0.50, 'R$/beira de mato (metro) pulverizacao drone - BANCO DE DADOS!B31'),
  ('Drone Valor Fio Luz', 'DRONE_VALOR_FIO_LUZ', 1.00, 'R$/fio de luz (metro) pulverizacao drone - BANCO DE DADOS!B32'),
  ('Drone Valor Ponto RTK', 'DRONE_VALOR_PONTO_RTK', 500.00, 'R$/ponto RTK pulverizacao drone - BANCO DE DADOS!B33'),
  ('AP Ate 50 Alqueires', 'AP_ATE_50_ALQ', 295.00, 'R$/Alq AP ate 50 alq - BANCO DE DADOS!B3'),
  ('AP 50 a 100 Alqueires', 'AP_50_A_100_ALQ', 278.30, 'R$/Alq AP 50 a 100 alq - BANCO DE DADOS!B4'),
  ('AP Mais de 100 Alqueires', 'AP_MAIS_100_ALQ', 262.55, 'R$/Alq AP mais de 100 alq - BANCO DE DADOS!B5'),
  ('Reanalise Ate 50 Alqueires', 'REANALISE_ATE_50_ALQ', 280.00, 'R$/Alq Reanalise ate 50 alq - BANCO DE DADOS!C3'),
  ('Reanalise 50 a 100 Alqueires', 'REANALISE_50_A_100_ALQ', 264.15, 'R$/Alq Reanalise 50 a 100 alq - BANCO DE DADOS!C4'),
  ('Reanalise Mais de 100 Alqueires', 'REANALISE_MAIS_100_ALQ', 249.20, 'R$/Alq Reanalise mais de 100 alq - BANCO DE DADOS!C5')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  value = EXCLUDED.value,
  description = EXCLUDED.description;

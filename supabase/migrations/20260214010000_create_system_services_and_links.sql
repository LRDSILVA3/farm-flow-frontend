-- Migration: Create system services and link cost variables from budget.xlsm

-- 1. Ensure unique constraint on services.name
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_name_key' AND conrelid = 'public.services'::regclass) THEN
    ALTER TABLE public.services ADD CONSTRAINT services_name_key UNIQUE (name);
  END IF;
END
$$;

-- 2. Make user_id nullable for system/fixed services
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'user_id') THEN
    IF (SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'user_id') = 'NO' THEN
      ALTER TABLE public.services ALTER COLUMN user_id DROP NOT NULL;
    END IF;
  END IF;
END
$$;

-- 3. Update RLS policy so all users can read fixed services
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Users can view fixed services') THEN
    DROP POLICY "Users can view fixed services" ON public.services;
  END IF;
END
$$;

CREATE POLICY "Users can view fixed services" ON public.services
  FOR SELECT USING (is_fixed = true OR auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- 4. Insert all budget system services
INSERT INTO public.services (name, is_fixed, status)
VALUES
  ('Conferência', true, 'Ativo'),
  ('Coleta Foliar', true, 'Ativo'),
  ('Compactação de Solo', true, 'Ativo'),
  ('Voo de Drone (Mapeamento)', true, 'Ativo'),
  ('Aplicação ATV', true, 'Ativo'),
  ('Amostragem de Solo (AP)', true, 'Ativo'),
  ('Pulverização Drone', true, 'Ativo'),
  ('Equalização de Serviços', true, 'Ativo')
ON CONFLICT (name) DO UPDATE SET
  is_fixed = EXCLUDED.is_fixed,
  status = EXCLUDED.status;

-- 5. Helper function or query to link variables to services
-- Link Conferência variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Conferência'
  AND v.code IN (
    'VALOR_OLEO_DIESEL',
    'VALOR_ALQ_CONFERENCIA',
    'VALOR_PONTO_CONFERE_COMPACTACAO',
    'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO',
    'VALOR_KM_CONFERENCIA_FOLHA',
    'ANALISE_20_40_CM_VALOR_ANALISE',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL',
    'VALOR_ANALISE_NOVA_AREA',
    'VALOR_ANALISE_ADUBO_BASE',
    'VALOR_ANALISE_ENXOFRE',
    'VALOR_ANALISE_FISICA_UNITARIO'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

-- Link Coleta Foliar variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Coleta Foliar'
  AND v.code IN (
    'VALOR_OLEO_DIESEL',
    'VALOR_ALQ_FOLHA',
    'VALOR_ANALISE_FOLIAR',
    'VALOR_PONTO_CONFERE_COMPACTACAO',
    'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO',
    'VALOR_KM_CONFERENCIA_FOLHA',
    'VALOR_VIAGEM_CONFERENCIA_FOLHA',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

-- Link Compactação de Solo variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Compactação de Solo'
  AND v.code IN (
    'VALOR_OLEO_DIESEL',
    'VALOR_PONTO_CONFERE_COMPACTACAO',
    'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO',
    'VALOR_KM_CONFERENCIA_FOLHA',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

-- Link Voo de Drone (Mapeamento) variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Voo de Drone (Mapeamento)'
  AND v.code IN (
    'VALOR_OLEO_DIESEL',
    'VOO_DRONE_ALQ_ANO',
    'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO',
    'VALOR_KM_CONFERENCIA_FOLHA',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

-- Link Aplicação ATV variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Aplicação ATV'
  AND v.code IN (
    'VALOR_OLEO_DIESEL',
    'ATV_1_PRODUTO',
    'ATV_2_PRODUTOS',
    'ATV_3_PRODUTOS',
    'VALOR_APLICACAO_ESTERCO',
    'VALOR_KM_FRETE',
    'VALOR_KM_DESLOCAMENTO',
    'DESPESA_VIAGEM_ATV',
    'DIARIA_PA_CARREGADEIRA',
    'HORA_PA_CARREGADEIRA',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

-- Link Amostragem de Solo (AP) variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Amostragem de Solo (AP)'
  AND v.code IN (
    'AP_ATE_50_ALQ',
    'AP_50_A_100_ALQ',
    'AP_MAIS_100_ALQ',
    'REANALISE_ATE_50_ALQ',
    'REANALISE_50_A_100_ALQ',
    'REANALISE_MAIS_100_ALQ',
    'VALOR_PONTO_CONFERE_COMPACTACAO',
    'VALOR_ANALISE_NOVA_AREA',
    'VALOR_ANALISE_ADUBO_BASE',
    'VALOR_ANALISE_ENXOFRE',
    'VALOR_ANALISE_MICRONUTRIENTES',
    'VALOR_ANALISE_FISICA_UNITARIO',
    'VALOR_ANALISE_COMPLETA_UNITARIO',
    'ANALISE_20_40_CM_VALOR_ANALISE',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

-- Link Pulverização Drone variables
INSERT INTO public.service_variables (service_id, variable_id)
SELECT s.id, v.id
FROM public.services s
CROSS JOIN public.cost_variables v
WHERE s.name = 'Pulverização Drone'
  AND v.code IN (
    'VALOR_OLEO_DIESEL',
    'DRONE_PULVE_BASE_ALQ',
    'DRONE_PULVE_PRECO_MINIMO_ALQ',
    'DRONE_PULVE_PRECO_PROGRAMADA',
    'DRONE_VALOR_OBSTACULO',
    'DRONE_VALOR_BEIRA_MATO',
    'DRONE_VALOR_FIO_LUZ',
    'DRONE_VALOR_PONTO_RTK',
    'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO',
    'DATA_BASE_CALCULO_JURO',
    'JUROS_PAGAMENTO_PRAZO_PERCENTUAL'
  )
ON CONFLICT (service_id, variable_id) DO NOTHING;

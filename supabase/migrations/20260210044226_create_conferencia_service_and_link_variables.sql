-- Ensure unique constraint on 'name' column in public.services exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_name_key' AND conrelid = 'public.services'::regclass) THEN
    ALTER TABLE public.services ADD CONSTRAINT services_name_key UNIQUE (name);
  END IF;
END
$$;

-- Insert "Conferencia" service
INSERT INTO public.services (name, user_id, is_fixed, status)
VALUES ('Conferencia', (SELECT id FROM auth.users LIMIT 1), true, 'active')
ON CONFLICT (name) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  is_fixed = EXCLUDED.is_fixed,
  status = EXCLUDED.status;

-- Link cost variables to "Conferencia" service
WITH ConferenciaService AS (
    SELECT id FROM public.services WHERE name = 'Conferência'
),
CostVariables AS (
    SELECT id, code FROM public.cost_variables
)
INSERT INTO public.service_variables (service_id, variable_id)
SELECT
    CS.id AS service_id,
    CV.id AS variable_id
FROM
    ConferenciaService CS,
    CostVariables CV
WHERE
    CV.code IN (
        'VALOR_ALQ_CONFERENCIA',
        'VALOR_KM_CONFERENCIA_FOLHA',
        'VALOR_PONTO_CONFERE_COMPACTACAO',
        'JUROS_PAGAMENTO_PRAZO_PERCENTUAL',
        'ANALISE_FISICA_CUSTO_ADICIONAL',
        'ANALISE_20_40_CM_VALOR_ANALISE',
        'ANALISE_MACRO_VALOR_ANALISE',
        'IMPOSTO_NOTA_FISCAL_PERCENTUAL',
        'VALOR_VIAGEM_CONFERENCIA_FOLHA'
    )
ON CONFLICT (service_id, variable_id) DO NOTHING;

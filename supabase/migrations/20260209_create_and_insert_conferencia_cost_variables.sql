-- Create the uuid-ossp extension if it doesn't already exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the cost_variables table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.cost_variables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  value numeric NOT NULL,
  description text
);

-- Ensure unique constraint on 'code' column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cost_variables_code_key' AND conrelid = 'public.cost_variables'::regclass) THEN
    ALTER TABLE public.cost_variables ADD CONSTRAINT cost_variables_code_key UNIQUE (code);
  END IF;
END
$$;

-- Make user_id nullable if it exists and is NOT NULL
DO $$
BEGIN
  -- Check if the column user_id exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cost_variables' AND column_name = 'user_id') THEN
    -- Check if the column user_id is NOT NULL
    IF (SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cost_variables' AND column_name = 'user_id') = 'NO' THEN
      ALTER TABLE public.cost_variables ALTER COLUMN user_id DROP NOT NULL;
    END IF;
  END IF;
END
$$;

-- Insert the cost variables for ConferenciaService
INSERT INTO public.cost_variables (name, code, value, description)
VALUES
  ('Valor Alqueire Conferencia', 'VALOR_ALQ_CONFERENCIA', 65.00, 'Valor por alqueire para o serviço de conferencia'),
  ('Valor KM Conferencia Folha', 'VALOR_KM_CONFERENCIA_FOLHA', 4.96, 'Valor por KM para conferencia de folha'),
  ('Valor Ponto Confere Compactacao', 'VALOR_PONTO_CONFERE_COMPACTACAO', 430.00, 'Valor por ponto de conferencia de compactacao'),
  ('Juros Pagamento Prazo Percentual', 'JUROS_PAGAMENTO_PRAZO_PERCENTUAL', 1.5, 'Percentual de juros para pagamento a prazo'),
  ('Analise Fisica Custo Adicional', 'ANALISE_FISICA_CUSTO_ADICIONAL', 175.30, 'Custo adicional para análise física (somatório INPUT DADOS D3:D5 + C24 se "S")'),
  ('Analise 20-40 CM Valor Analise', 'ANALISE_20_40_CM_VALOR_ANALISE', 70.00, 'Valor da análise de 20-40 cm'),
  ('Analise Macro Valor Analise', 'ANALISE_MACRO_VALOR_ANALISE', 52.30, 'Valor da análise macro'),
  ('Imposto Nota Fiscal Percentual', 'IMPOSTO_NOTA_FISCAL_PERCENTUAL', 5.0, 'Percentual de imposto para emissão de nota fiscal. Valor assumido.'),
  ('Valor Viagem Conferencia Folha', 'VALOR_VIAGEM_CONFERENCIA_FOLHA', 330.00, 'Valor por viagem para conferencia de folha')
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    value = EXCLUDED.value,
    description = EXCLUDED.description;
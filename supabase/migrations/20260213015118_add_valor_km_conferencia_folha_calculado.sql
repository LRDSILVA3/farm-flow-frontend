-- Add VALOR_KM_CONFERENCIA_FOLHA_CALCULADO cost variable
INSERT INTO public.cost_variables (name, code, value, description)
VALUES
  ('Valor KM Conferencia Folha Calculado', 'VALOR_KM_CONFERENCIA_FOLHA_CALCULADO', 4.95798, 'Valor por KM para conferencia de folha (calculado de BANCO DE DADOS!B12)')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    value = EXCLUDED.value,
    description = EXCLUDED.description;

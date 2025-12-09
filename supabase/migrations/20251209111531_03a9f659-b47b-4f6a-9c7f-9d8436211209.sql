-- Add is_fixed column to servicos table to mark services that cannot be deleted
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS is_fixed boolean DEFAULT false;

-- Create table for cost variables
CREATE TABLE public.variaveis_custo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  codigo text NOT NULL,
  valor numeric DEFAULT 0,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for service-variable relationships
CREATE TABLE public.servico_variaveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id uuid NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  variavel_id uuid NOT NULL REFERENCES public.variaveis_custo(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(servico_id, variavel_id)
);

-- Enable RLS on variaveis_custo
ALTER TABLE public.variaveis_custo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own variaveis_custo" ON public.variaveis_custo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own variaveis_custo" ON public.variaveis_custo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own variaveis_custo" ON public.variaveis_custo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own variaveis_custo" ON public.variaveis_custo FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on servico_variaveis (based on servico ownership)
ALTER TABLE public.servico_variaveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view servico_variaveis of their servicos" ON public.servico_variaveis FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.servicos WHERE servicos.id = servico_variaveis.servico_id AND servicos.user_id = auth.uid())
);
CREATE POLICY "Users can create servico_variaveis for their servicos" ON public.servico_variaveis FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.servicos WHERE servicos.id = servico_variaveis.servico_id AND servicos.user_id = auth.uid())
);
CREATE POLICY "Users can delete servico_variaveis of their servicos" ON public.servico_variaveis FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.servicos WHERE servicos.id = servico_variaveis.servico_id AND servicos.user_id = auth.uid())
);

-- Create trigger for updated_at on variaveis_custo
CREATE TRIGGER update_variaveis_custo_updated_at
BEFORE UPDATE ON public.variaveis_custo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
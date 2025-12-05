-- Table for services (Serviços)
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_alqueire TEXT,
  status TEXT DEFAULT 'Ativo',
  produtos TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own servicos" ON public.servicos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own servicos" ON public.servicos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own servicos" ON public.servicos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own servicos" ON public.servicos FOR DELETE USING (auth.uid() = user_id);

-- Table for products (Produtos)
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_un TEXT,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own produtos" ON public.produtos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own produtos" ON public.produtos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own produtos" ON public.produtos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own produtos" ON public.produtos FOR DELETE USING (auth.uid() = user_id);

-- Table for equipment (Equipamentos)
CREATE TABLE public.equipamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  status TEXT DEFAULT 'Disponível',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own equipamentos" ON public.equipamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own equipamentos" ON public.equipamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own equipamentos" ON public.equipamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own equipamentos" ON public.equipamentos FOR DELETE USING (auth.uid() = user_id);

-- Table for collaborators (Colaboradores)
CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  endereco TEXT,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own colaboradores" ON public.colaboradores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own colaboradores" ON public.colaboradores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own colaboradores" ON public.colaboradores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own colaboradores" ON public.colaboradores FOR DELETE USING (auth.uid() = user_id);

-- Table for analyses configuration (Análises)
CREATE TABLE public.analises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'Solo',
  colaborador TEXT,
  prazo INTEGER DEFAULT 0,
  valor TEXT,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analises" ON public.analises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analises" ON public.analises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analises" ON public.analises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analises" ON public.analises FOR DELETE USING (auth.uid() = user_id);

-- Table for service groups (Grupos de Serviços)
CREATE TABLE public.grupos_servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  servicos_ids TEXT[],
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.grupos_servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grupos_servicos" ON public.grupos_servicos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own grupos_servicos" ON public.grupos_servicos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own grupos_servicos" ON public.grupos_servicos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own grupos_servicos" ON public.grupos_servicos FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipamentos_updated_at BEFORE UPDATE ON public.equipamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analises_updated_at BEFORE UPDATE ON public.analises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grupos_servicos_updated_at BEFORE UPDATE ON public.grupos_servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
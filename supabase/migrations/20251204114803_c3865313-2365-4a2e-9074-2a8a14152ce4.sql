
-- Tabela de execuções (para a agenda)
CREATE TABLE public.execucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  fazenda_id UUID REFERENCES public.fazendas(id) ON DELETE SET NULL,
  servico TEXT,
  area DECIMAL(10,2),
  data_agendada DATE,
  equipamento TEXT,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de execuções parciais
CREATE TABLE public.execucoes_parciais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execucao_id UUID NOT NULL REFERENCES public.execucoes(id) ON DELETE CASCADE,
  data DATE,
  area_executada DECIMAL(10,2),
  equipamento TEXT,
  operador TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'Concluída',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de análises
CREATE TABLE public.analises_execucao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_analise TEXT NOT NULL,
  colaborador TEXT,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  fazenda_id UUID REFERENCES public.fazendas(id) ON DELETE SET NULL,
  talhao_id UUID REFERENCES public.talhoes(id) ON DELETE SET NULL,
  quantidade INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Pendente',
  data_envio DATE,
  data_recebimento DATE,
  data_finalizacao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execucoes_parciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_execucao ENABLE ROW LEVEL SECURITY;

-- RLS Policies for execucoes
CREATE POLICY "Users can view their own execucoes" ON public.execucoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own execucoes" ON public.execucoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own execucoes" ON public.execucoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own execucoes" ON public.execucoes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for execucoes_parciais (based on execucao ownership)
CREATE POLICY "Users can view execucoes_parciais of their execucoes" ON public.execucoes_parciais FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.execucoes WHERE execucoes.id = execucoes_parciais.execucao_id AND execucoes.user_id = auth.uid())
);
CREATE POLICY "Users can create execucoes_parciais in their execucoes" ON public.execucoes_parciais FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.execucoes WHERE execucoes.id = execucoes_parciais.execucao_id AND execucoes.user_id = auth.uid())
);
CREATE POLICY "Users can update execucoes_parciais of their execucoes" ON public.execucoes_parciais FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.execucoes WHERE execucoes.id = execucoes_parciais.execucao_id AND execucoes.user_id = auth.uid())
);
CREATE POLICY "Users can delete execucoes_parciais of their execucoes" ON public.execucoes_parciais FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.execucoes WHERE execucoes.id = execucoes_parciais.execucao_id AND execucoes.user_id = auth.uid())
);

-- RLS Policies for analises_execucao
CREATE POLICY "Users can view their own analises" ON public.analises_execucao FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analises" ON public.analises_execucao FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analises" ON public.analises_execucao FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analises" ON public.analises_execucao FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_execucoes_updated_at BEFORE UPDATE ON public.execucoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_execucoes_parciais_updated_at BEFORE UPDATE ON public.execucoes_parciais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analises_execucao_updated_at BEFORE UPDATE ON public.analises_execucao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

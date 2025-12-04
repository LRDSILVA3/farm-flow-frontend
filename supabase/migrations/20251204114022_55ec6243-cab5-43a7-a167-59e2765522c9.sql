
-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  cad_pro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de fazendas
CREATE TABLE public.fazendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  proprietario TEXT,
  area DECIMAL(10,2),
  cidade TEXT,
  estado TEXT,
  contato TEXT,
  status TEXT DEFAULT 'Ativo',
  matricula TEXT,
  lote TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de talhões
CREATE TABLE public.talhoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fazenda_id UUID NOT NULL REFERENCES public.fazendas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  area DECIMAL(10,2),
  status TEXT DEFAULT 'Ativo',
  cidade TEXT,
  estado TEXT,
  matricula TEXT,
  lote TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  fazenda_id UUID REFERENCES public.fazendas(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'Serviço',
  servico TEXT,
  produtos JSONB DEFAULT '[]'::jsonb,
  grupo_servico TEXT,
  area DECIMAL(10,2),
  valor DECIMAL(10,2),
  status TEXT DEFAULT 'Pendente',
  pagamento TEXT DEFAULT 'Aguardando',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talhoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clientes
CREATE POLICY "Users can view their own clientes" ON public.clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own clientes" ON public.clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clientes" ON public.clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clientes" ON public.clientes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fazendas
CREATE POLICY "Users can view their own fazendas" ON public.fazendas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own fazendas" ON public.fazendas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fazendas" ON public.fazendas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fazendas" ON public.fazendas FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for talhoes (based on fazenda ownership)
CREATE POLICY "Users can view talhoes of their fazendas" ON public.talhoes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.fazendas WHERE fazendas.id = talhoes.fazenda_id AND fazendas.user_id = auth.uid())
);
CREATE POLICY "Users can create talhoes in their fazendas" ON public.talhoes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.fazendas WHERE fazendas.id = talhoes.fazenda_id AND fazendas.user_id = auth.uid())
);
CREATE POLICY "Users can update talhoes of their fazendas" ON public.talhoes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.fazendas WHERE fazendas.id = talhoes.fazenda_id AND fazendas.user_id = auth.uid())
);
CREATE POLICY "Users can delete talhoes of their fazendas" ON public.talhoes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.fazendas WHERE fazendas.id = talhoes.fazenda_id AND fazendas.user_id = auth.uid())
);

-- RLS Policies for pedidos
CREATE POLICY "Users can view their own pedidos" ON public.pedidos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own pedidos" ON public.pedidos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pedidos" ON public.pedidos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pedidos" ON public.pedidos FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fazendas_updated_at BEFORE UPDATE ON public.fazendas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_talhoes_updated_at BEFORE UPDATE ON public.talhoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

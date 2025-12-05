-- Function to create execution when pedido is approved
CREATE OR REPLACE FUNCTION public.create_execucao_on_pedido_aprovado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if status changed to 'Aprovado'
  IF NEW.status = 'Aprovado' AND (OLD.status IS NULL OR OLD.status != 'Aprovado') THEN
    -- Create execution record
    INSERT INTO public.execucoes (
      user_id,
      pedido_id,
      cliente_id,
      fazenda_id,
      servico,
      area,
      status
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.cliente_id,
      NEW.fazenda_id,
      NEW.servico,
      NEW.area,
      'Pendente'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on pedidos table
DROP TRIGGER IF EXISTS trigger_create_execucao_on_aprovado ON public.pedidos;

CREATE TRIGGER trigger_create_execucao_on_aprovado
AFTER UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.create_execucao_on_pedido_aprovado();
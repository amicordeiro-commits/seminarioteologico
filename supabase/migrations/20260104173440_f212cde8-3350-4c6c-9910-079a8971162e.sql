-- Função auxiliar para criar notificações
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_link text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (p_user_id, p_title, p_message, p_type, p_link);
END;
$$;

-- Trigger para notificar quando certificado é emitido
CREATE OR REPLACE FUNCTION public.notify_certificate_issued()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.user_id,
    'Certificado Emitido',
    'Parabéns! Seu certificado foi emitido com sucesso.',
    'success',
    '/certificates'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_certificate_issued ON public.certificates;
CREATE TRIGGER on_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_certificate_issued();

-- Trigger para notificar quando mensagem é recebida
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.receiver_id,
    'Nova Mensagem',
    'Você recebeu uma nova mensagem.',
    'info',
    '/messages'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();
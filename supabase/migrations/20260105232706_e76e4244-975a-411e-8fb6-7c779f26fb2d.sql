-- Trigger para notificar quando há nova resposta no fórum
CREATE OR REPLACE FUNCTION public.notify_forum_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  topic_author uuid;
  topic_title text;
BEGIN
  -- Buscar autor e título do tópico
  SELECT user_id, title INTO topic_author, topic_title
  FROM public.forum_topics 
  WHERE id = NEW.topic_id;
  
  -- Não notificar se o autor da resposta é o mesmo do tópico
  IF topic_author IS NOT NULL AND topic_author != NEW.user_id THEN
    PERFORM public.create_notification(
      topic_author,
      'Nova Resposta no Fórum',
      'Alguém respondeu ao seu tópico: ' || COALESCE(topic_title, 'Sem título'),
      'info',
      '/forum'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_forum_reply ON public.forum_replies;
CREATE TRIGGER on_forum_reply
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_forum_reply();

-- Trigger para notificar quando novo curso é publicado
CREATE OR REPLACE FUNCTION public.notify_new_course()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas quando o curso é publicado (is_published muda de false para true)
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    -- Notificar todos os usuários com perfil
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      p.id,
      'Novo Curso Disponível',
      'O curso "' || NEW.title || '" está disponível!',
      'info',
      '/courses'
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_course_published ON public.courses;
CREATE TRIGGER on_course_published
  AFTER INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_course();

-- Trigger para notificar sobre novo devocional
CREATE OR REPLACE FUNCTION public.notify_new_devotional()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notificar quando devocional é publicado para a data atual
  IF NEW.publish_date = CURRENT_DATE THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      p.id,
      'Devocional do Dia',
      NEW.title,
      'info',
      '/devotional'
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_devotional_published ON public.devotionals;
CREATE TRIGGER on_devotional_published
  AFTER INSERT ON public.devotionals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_devotional();
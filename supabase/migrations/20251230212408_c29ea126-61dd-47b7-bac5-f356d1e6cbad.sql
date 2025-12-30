-- Add recovery fields to quiz_attempts
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS is_recovery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS original_attempt_id uuid REFERENCES public.quiz_attempts(id),
ADD COLUMN IF NOT EXISTS recovery_count integer DEFAULT 0;

-- Create recovery settings table
CREATE TABLE IF NOT EXISTS public.quiz_recovery_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  allow_recovery boolean DEFAULT true,
  max_recovery_attempts integer DEFAULT 2,
  recovery_passing_score integer DEFAULT 60,
  wait_hours_before_recovery integer DEFAULT 24,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_recovery_settings ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_recovery_settings
CREATE POLICY "Admins can manage recovery settings"
  ON public.quiz_recovery_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view recovery settings"
  ON public.quiz_recovery_settings
  FOR SELECT
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_quiz_recovery_settings_updated_at
  BEFORE UPDATE ON public.quiz_recovery_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
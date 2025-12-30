-- Table for user settings/preferences
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  -- Notifications
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  new_course_notifications boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  reminder_notifications boolean DEFAULT false,
  weekly_digest boolean DEFAULT true,
  -- Appearance
  theme text DEFAULT 'system',
  font_size text DEFAULT 'medium',
  -- Language
  language text DEFAULT 'pt-BR',
  timezone text DEFAULT 'america-sao_paulo',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table for devotional interactions (likes/bookmarks)
CREATE TABLE public.devotional_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  is_liked boolean DEFAULT false,
  is_bookmarked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, devotional_id)
);

-- Table for study sessions (track time)
CREATE TABLE public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  duration_seconds integer DEFAULT 0,
  session_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Table for devotional reading streak
CREATE TABLE public.devotional_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_read_date date,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_streaks ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Policies for devotional_interactions
CREATE POLICY "Users can view their own interactions" ON public.devotional_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interactions" ON public.devotional_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.devotional_interactions FOR UPDATE USING (auth.uid() = user_id);

-- Policies for study_sessions
CREATE POLICY "Users can view their own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.study_sessions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Policies for devotional_streaks
CREATE POLICY "Users can view their own streak" ON public.devotional_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streak" ON public.devotional_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streak" ON public.devotional_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to create events in calendar
CREATE POLICY "Users can create their own events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON public.calendar_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own events" ON public.calendar_events FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Users can view their own private events" ON public.calendar_events FOR SELECT USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devotional_interactions_updated_at BEFORE UPDATE ON public.devotional_interactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devotional_streaks_updated_at BEFORE UPDATE ON public.devotional_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
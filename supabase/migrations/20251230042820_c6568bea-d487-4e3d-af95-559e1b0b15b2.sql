-- Tabela de planos/cursos com preços
CREATE TABLE public.course_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  installments INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de transações financeiras dos alunos
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  plan_id UUID REFERENCES public.course_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'tuition', -- tuition, donation, material, other
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- pix, boleto, credit_card
  reference TEXT, -- número do boleto, id do pix
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de doações
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT, -- monthly, quarterly, yearly
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de leads/candidatos (Admissões)
CREATE TABLE public.admission_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  interest_course TEXT,
  how_found_us TEXT, -- google, social, indication, church
  status TEXT DEFAULT 'new', -- new, contacted, interested, enrolled, declined
  notes TEXT,
  assigned_to UUID, -- admin responsável
  last_contact_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de discussões do fórum
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de respostas do fórum
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de histórico acadêmico
CREATE TABLE public.academic_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  grade DECIMAL(4,2), -- nota final
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, failed, withdrawn
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_id UUID REFERENCES public.certificates(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.course_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_plans
CREATE POLICY "Course plans are viewable by all" ON public.course_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage course plans" ON public.course_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view their own transactions" ON public.financial_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.financial_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage transactions" ON public.financial_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for donations
CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage donations" ON public.donations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for admission_leads
CREATE POLICY "Admins can manage leads" ON public.admission_leads FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for forum_topics
CREATE POLICY "Authenticated users can view forum topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all topics" ON public.forum_topics FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for forum_replies
CREATE POLICY "Authenticated users can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all replies" ON public.forum_replies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for academic_records
CREATE POLICY "Users can view their own records" ON public.academic_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all records" ON public.academic_records FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage records" ON public.academic_records FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
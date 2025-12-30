-- Permitir que admins vejam e gerenciem todas as matrículas
CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all enrollments" 
ON public.enrollments 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enrollments" 
ON public.enrollments 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert enrollments" 
ON public.enrollments 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins emitam certificados para qualquer usuário
CREATE POLICY "Admins can insert certificates" 
ON public.certificates 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update certificates" 
ON public.certificates 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete certificates" 
ON public.certificates 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam progresso de todos os alunos
CREATE POLICY "Admins can view all lesson progress" 
ON public.lesson_progress 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam todas as tentativas de quiz
CREATE POLICY "Admins can view all quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins gerenciem quiz_questions
CREATE POLICY "Admins can insert quiz questions" 
ON public.quiz_questions 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quiz questions" 
ON public.quiz_questions 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quiz questions" 
ON public.quiz_questions 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins gerenciem quiz_options
CREATE POLICY "Admins can insert quiz options" 
ON public.quiz_options 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quiz options" 
ON public.quiz_options 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quiz options" 
ON public.quiz_options 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins gerenciem quizzes completamente
CREATE POLICY "Admins can insert quizzes" 
ON public.quizzes 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quizzes" 
ON public.quizzes 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quizzes" 
ON public.quizzes 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all quizzes" 
ON public.quizzes 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam e gerenciem mensagens
CREATE POLICY "Admins can view all messages" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete messages" 
ON public.messages 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins gerenciem bible_studies
CREATE POLICY "Admins can insert bible studies" 
ON public.bible_studies 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bible studies" 
ON public.bible_studies 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bible studies" 
ON public.bible_studies 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
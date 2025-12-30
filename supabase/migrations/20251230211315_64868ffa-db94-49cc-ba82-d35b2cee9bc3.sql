-- Create backups table to track backups
CREATE TABLE public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  tables_included text[] NOT NULL,
  records_count jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Only admins can manage backups
CREATE POLICY "Admins can manage backups"
  ON public.backups
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for backups bucket
CREATE POLICY "Admins can upload backups"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'backups' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view backups"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'backups' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete backups"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'backups' AND has_role(auth.uid(), 'admin'::app_role));
-- Criar políticas de storage para o bucket library

-- Política para permitir que admins façam upload
CREATE POLICY "Admins can upload to library"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'library' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Política para permitir que admins atualizem arquivos
CREATE POLICY "Admins can update library files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'library' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Política para permitir que admins deletem arquivos
CREATE POLICY "Admins can delete library files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'library' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Política para permitir leitura pública do bucket library
CREATE POLICY "Anyone can read library files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'library');
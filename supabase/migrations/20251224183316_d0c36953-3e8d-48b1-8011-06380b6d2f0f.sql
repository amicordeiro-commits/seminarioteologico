-- Add content column to library_materials for storing full text content
ALTER TABLE public.library_materials 
ADD COLUMN content TEXT;

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.library_materials.content IS 'Full text content for text-based materials like sermons, articles, etc.';
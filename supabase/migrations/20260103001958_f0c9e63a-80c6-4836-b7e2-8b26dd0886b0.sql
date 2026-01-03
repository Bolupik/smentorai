-- Add new columns to knowledge_base table
ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS link_url text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- Create storage bucket for knowledge images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge-images', 'knowledge-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for knowledge images
CREATE POLICY "Anyone can view knowledge images"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-images');

CREATE POLICY "Authenticated users can upload knowledge images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'knowledge-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own knowledge images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'knowledge-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge images"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create votes tracking table to prevent multiple votes
CREATE TABLE IF NOT EXISTS public.knowledge_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  entry_id uuid NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_id)
);

-- Enable RLS on votes table
ALTER TABLE public.knowledge_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for votes
CREATE POLICY "Users can view their own votes"
ON public.knowledge_votes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own votes"
ON public.knowledge_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.knowledge_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.knowledge_votes FOR DELETE
USING (auth.uid() = user_id);
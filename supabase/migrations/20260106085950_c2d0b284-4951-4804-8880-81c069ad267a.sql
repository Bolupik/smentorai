-- Create comments table for knowledge base entries
CREATE TABLE public.knowledge_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on approved entries
CREATE POLICY "Anyone can view comments on approved entries"
ON public.knowledge_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_base 
    WHERE id = entry_id AND approved = true
  )
);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
ON public.knowledge_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.knowledge_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all comments
CREATE POLICY "Admins can manage all comments"
ON public.knowledge_comments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
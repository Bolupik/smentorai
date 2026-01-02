-- Create knowledge_base table for community contributions
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Users can view all approved knowledge or their own submissions
CREATE POLICY "Users can view approved knowledge or own submissions"
ON public.knowledge_base
FOR SELECT
USING (approved = true OR auth.uid() = user_id);

-- Users can insert their own knowledge contributions
CREATE POLICY "Users can insert knowledge contributions"
ON public.knowledge_base
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own knowledge contributions
CREATE POLICY "Users can update own contributions"
ON public.knowledge_base
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own knowledge contributions
CREATE POLICY "Users can delete own contributions"
ON public.knowledge_base
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stacks_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  relevance_score NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(url)
);

ALTER TABLE public.stacks_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News is publicly readable" ON public.stacks_news
  FOR SELECT USING (true);

CREATE INDEX idx_stacks_news_published ON public.stacks_news(published_at DESC);
CREATE INDEX idx_stacks_news_relevance ON public.stacks_news(relevance_score DESC);

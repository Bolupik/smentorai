
CREATE TABLE public.knowledge_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_bookmarks TO authenticated;
GRANT ALL ON public.knowledge_bookmarks TO service_role;

ALTER TABLE public.knowledge_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON public.knowledge_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.knowledge_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.knowledge_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_knowledge_bookmarks_user ON public.knowledge_bookmarks(user_id, created_at DESC);

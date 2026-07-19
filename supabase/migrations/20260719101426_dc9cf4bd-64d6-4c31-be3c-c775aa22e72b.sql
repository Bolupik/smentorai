
ALTER TABLE public.knowledge_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.knowledge_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS upvotes integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS knowledge_comments_parent_id_idx ON public.knowledge_comments(parent_id);
CREATE INDEX IF NOT EXISTS knowledge_comments_entry_id_idx ON public.knowledge_comments(entry_id);

CREATE TABLE IF NOT EXISTS public.knowledge_comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.knowledge_comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

GRANT SELECT, INSERT, DELETE ON public.knowledge_comment_votes TO authenticated;
GRANT ALL ON public.knowledge_comment_votes TO service_role;

ALTER TABLE public.knowledge_comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read comment votes"
  ON public.knowledge_comment_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add their own comment votes"
  ON public.knowledge_comment_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own comment votes"
  ON public.knowledge_comment_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

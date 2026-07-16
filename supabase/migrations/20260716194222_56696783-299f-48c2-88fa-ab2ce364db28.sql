
ALTER TABLE public.knowledge_base
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.knowledge_base
  ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION public.knowledge_base_search_tsv_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.topic, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(NEW.tags, '{}'), ' ')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS knowledge_base_search_tsv_trg ON public.knowledge_base;
CREATE TRIGGER knowledge_base_search_tsv_trg
  BEFORE INSERT OR UPDATE OF topic, content, category, tags
  ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_base_search_tsv_update();

CREATE INDEX IF NOT EXISTS knowledge_base_search_tsv_idx
  ON public.knowledge_base USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS knowledge_base_tags_idx
  ON public.knowledge_base USING GIN (tags);

-- Seed tags on curated entries and backfill search_tsv for all rows
UPDATE public.knowledge_base SET tags = ARRAY['roadmap','2026','sBTC','clarity','dual-stacking']
  WHERE topic = 'Stacks 2026 Vision: A Financial System Built on Bitcoin';
UPDATE public.knowledge_base SET tags = ARRAY['bitcoin-staking','PoX','PoX-5','yield','SIP']
  WHERE topic = 'Bitcoin Staking on Stacks (PoX-5)';
UPDATE public.knowledge_base SET tags = ARRAY['Nakamoto','upgrade','finality','throughput']
  WHERE topic = 'Nakamoto Upgrade: Fast Blocks + Bitcoin Finality';
UPDATE public.knowledge_base SET tags = ARRAY['sBTC','peg','DeFi','liquidity']
  WHERE topic = 'sBTC: The Decentralized Bitcoin Peg';
UPDATE public.knowledge_base SET tags = ARRAY['clarity','SIP-039','clarity-5','contracts']
  WHERE topic = 'Clarity 5 (SIP-039): Unrestricted Contract Composability';
UPDATE public.knowledge_base SET tags = ARRAY['stBTC','StackingDAO','liquid-staking','yield']
  WHERE topic = 'stBTC: Liquid Bitcoin Staking by StackingDAO';
UPDATE public.knowledge_base SET tags = ARRAY['upgrade','network','AI-agents','DeFi','Bitflow']
  WHERE topic = 'Stacks 3.3.0.0.6 Upgrade: Reliability for BTC AI Agents & DeFi';
UPDATE public.knowledge_base SET tags = ARRAY['Fireblocks','institutional','custody','staking']
  WHERE topic = 'Stacks Live on Fireblocks — Institutional On-Ramp for Bitcoin Staking';

-- Force backfill of search_tsv for rows we didn't touch above
UPDATE public.knowledge_base SET topic = topic WHERE search_tsv IS NULL;

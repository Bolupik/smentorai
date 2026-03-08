-- Daily quiz cache table (one AI-generated quiz per day)
CREATE TABLE public.daily_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_date DATE NOT NULL UNIQUE,
  questions JSONB NOT NULL,
  generated_by TEXT DEFAULT 'ai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Per-user quiz result tracking
CREATE TABLE public.daily_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_date DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 15,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, quiz_date)
);

-- Enable RLS
ALTER TABLE public.daily_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_results ENABLE ROW LEVEL SECURITY;

-- daily_quizzes: anyone authenticated can read, only service role can write
CREATE POLICY "Authenticated users can read daily quizzes"
  ON public.daily_quizzes FOR SELECT
  TO authenticated
  USING (true);

-- daily_quiz_results: users own their results
CREATE POLICY "Users can view their own quiz results"
  ON public.daily_quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
  ON public.daily_quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz results"
  ON public.daily_quiz_results FOR UPDATE
  USING (auth.uid() = user_id);
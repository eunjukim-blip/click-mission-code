-- Create daily ranking rewards table
CREATE TABLE public.daily_ranking_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  ranking_date DATE NOT NULL,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
  level INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  reward_amount INTEGER NOT NULL,
  rewarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_identifier, ranking_date, level)
);

-- Enable RLS
ALTER TABLE public.daily_ranking_rewards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view their rewards
CREATE POLICY "Users can view their own rewards"
ON public.daily_ranking_rewards
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_daily_rewards_date ON public.daily_ranking_rewards(ranking_date DESC);
CREATE INDEX idx_daily_rewards_user ON public.daily_ranking_rewards(user_identifier);

-- Create index on number_sequence_results for ranking queries
CREATE INDEX IF NOT EXISTS idx_number_sequence_date ON public.number_sequence_results(created_at DESC, level, time_taken ASC);
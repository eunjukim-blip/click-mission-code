-- Create rock_paper_scissors_games table
CREATE TABLE IF NOT EXISTS public.rock_paper_scissors_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rounds_played INTEGER NOT NULL,
  rounds_won INTEGER NOT NULL,
  rounds_lost INTEGER NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'lose')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rock_paper_scissors_games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own games" 
ON public.rock_paper_scissors_games 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" 
ON public.rock_paper_scissors_games 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_rock_paper_scissors_games_user_id ON public.rock_paper_scissors_games(user_id);
CREATE INDEX idx_rock_paper_scissors_games_created_at ON public.rock_paper_scissors_games(created_at DESC);
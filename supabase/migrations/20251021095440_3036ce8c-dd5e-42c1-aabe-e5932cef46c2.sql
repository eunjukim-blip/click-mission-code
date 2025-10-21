-- Create memory game results table
CREATE TABLE public.memory_game_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempts integer NOT NULL,
  time_taken integer NOT NULL,
  success boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.memory_game_results ENABLE ROW LEVEL SECURITY;

-- Create policies for memory game results
CREATE POLICY "Anyone can insert memory results" 
ON public.memory_game_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view memory results" 
ON public.memory_game_results 
FOR SELECT 
USING (true);
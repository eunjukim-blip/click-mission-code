-- Create number sequence game results table
CREATE TABLE public.number_sequence_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_identifier TEXT
);

-- Enable Row Level Security
ALTER TABLE public.number_sequence_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view number sequence results"
ON public.number_sequence_results
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert number sequence results"
ON public.number_sequence_results
FOR INSERT
WITH CHECK (true);

-- Create index for faster ranking queries
CREATE INDEX idx_number_sequence_level_time ON public.number_sequence_results(level, time_taken);
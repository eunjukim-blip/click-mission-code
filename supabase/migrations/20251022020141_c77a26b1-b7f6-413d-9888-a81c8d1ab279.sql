-- Add question column to quiz_completions table to track completed questions
ALTER TABLE public.quiz_completions 
ADD COLUMN question TEXT;

-- Create index for faster lookups
CREATE INDEX idx_quiz_completions_user_question ON public.quiz_completions(user_identifier, question);
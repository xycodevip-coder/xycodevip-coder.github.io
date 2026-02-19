-- Add linkedin_post_url column to task_submissions
ALTER TABLE public.task_submissions
  ADD COLUMN IF NOT EXISTS linkedin_post_url TEXT;

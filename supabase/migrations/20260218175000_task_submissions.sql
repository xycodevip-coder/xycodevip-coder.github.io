-- Add unique constraints to internship_applications for email and phone
ALTER TABLE public.internship_applications
  ADD CONSTRAINT internship_applications_email_unique UNIQUE (email);

ALTER TABLE public.internship_applications
  ADD CONSTRAINT internship_applications_phone_unique UNIQUE (phone);

-- Create task_submissions table
CREATE TABLE public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  track TEXT NOT NULL,
  submission_notes TEXT,
  github_submission_url TEXT,
  task_delivered BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a task submission (accepted interns)
CREATE POLICY "Allow public insert task submissions" ON public.task_submissions
  FOR INSERT TO public WITH CHECK (true);

-- Authenticated users (admins) can view all submissions
CREATE POLICY "Allow authenticated view task submissions" ON public.task_submissions
  FOR SELECT TO authenticated USING (true);

-- Authenticated users (admins) can update submissions
CREATE POLICY "Allow authenticated update task submissions" ON public.task_submissions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Add task_delivered column to certificates table to track if student delivered their task
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS task_delivered BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Index for fast lookups
CREATE INDEX idx_task_submissions_email ON public.task_submissions(email);
CREATE INDEX idx_task_submissions_application_id ON public.task_submissions(application_id);

-- Enable RLS on internship_applications
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to query internship_applications (needed for verification step)
-- This allows anyone to check status by email if they know the email
CREATE POLICY "Allow public select internship_applications" ON public.internship_applications
  FOR SELECT TO public USING (true);

-- Allow public to check for existing task submissions
CREATE POLICY "Allow public select task_submissions" ON public.task_submissions
  FOR SELECT TO public USING (true);

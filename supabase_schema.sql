-- Create the table for internship applications
CREATE TABLE internship_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    university TEXT,
    track TEXT NOT NULL,
    github_url TEXT,
    portfolio_url TEXT,
    motivation TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow anyone to insert (submit application)
CREATE POLICY "Allow public insert" ON internship_applications
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow authenticated users (admin) to view all applications
CREATE POLICY "Allow authenticated view" ON internship_applications
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users (admin) to update applications
CREATE POLICY "Allow authenticated update" ON internship_applications
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users (admin) to delete applications
CREATE POLICY "Allow authenticated delete" ON internship_applications
    FOR DELETE
    TO authenticated
    USING (true);

-- Optional: Create an index on email for faster lookups
CREATE INDEX idx_internship_applications_email ON internship_applications(email);

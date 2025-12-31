-- Create book_requests table
CREATE TABLE IF NOT EXISTS book_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_name TEXT NOT NULL,
    author TEXT NOT NULL,
    edition TEXT,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own requests
CREATE POLICY "Users can insert their own book requests"
    ON book_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to view their own requests
CREATE POLICY "Users can view their own book requests"
    ON book_requests
    FOR SELECT
    TO authenticated
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_book_requests_updated_at
    BEFORE UPDATE ON book_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
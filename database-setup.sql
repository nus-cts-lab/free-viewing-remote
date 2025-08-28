-- =============================================
-- Free Viewing Task - Database Setup
-- =============================================
-- 
-- This file contains all the SQL commands needed to set up the database
-- for the Free Viewing Task psychology experiment system.
-- 
-- Instructions:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to the SQL Editor in your Supabase dashboard
-- 3. Copy and paste this entire file into the SQL Editor
-- 4. Click "Run" to execute all commands
-- 5. Update js/supabase-client.js with your project URL and anon key
--
-- =============================================

-- Create the experiment_sessions table
-- Note: ID is TEXT type to support custom session IDs like "EXP_20250828_p123_s001"
CREATE TABLE IF NOT EXISTS experiment_sessions (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL,
    email TEXT NOT NULL,
    session TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'partial',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_experiment_sessions_participant_id ON experiment_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_sessions_session ON experiment_sessions(session);
CREATE INDEX IF NOT EXISTS idx_experiment_sessions_status ON experiment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_experiment_sessions_completed_at ON experiment_sessions(completed_at DESC);

-- Create the storage bucket for experiment files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('experiment-files', 'experiment-files', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public access for experiment uploads
-- Note: This allows anonymous uploads for research purposes
-- In production, you may want to implement more restrictive policies

-- Policy to allow public uploads to the experiment-files bucket
CREATE POLICY IF NOT EXISTS "Allow public uploads to experiment-files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'experiment-files');

-- Policy to allow public downloads from the experiment-files bucket  
CREATE POLICY IF NOT EXISTS "Allow public downloads from experiment-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'experiment-files');

-- Policy to allow public updates to the experiment-files bucket
CREATE POLICY IF NOT EXISTS "Allow public updates to experiment-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'experiment-files');

-- Policy to allow public deletes from the experiment-files bucket
CREATE POLICY IF NOT EXISTS "Allow public deletes from experiment-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'experiment-files');

-- Disable Row Level Security for easier setup (academic research use)
-- Note: This allows unrestricted access to the experiment_sessions table
-- For production use, you may want to enable RLS and create appropriate policies
ALTER TABLE experiment_sessions DISABLE ROW LEVEL SECURITY;

-- Create telegram_subscribers table for notification management
CREATE TABLE IF NOT EXISTS telegram_subscribers (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    name TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_active ON telegram_subscribers(active);

-- Disable RLS on telegram_subscribers table as well
ALTER TABLE telegram_subscribers DISABLE ROW LEVEL SECURITY;

-- To add subscribers after setup, run these commands:
INSERT INTO telegram_subscribers (chat_id, name, active)
VALUES (YOUR_CHAT_ID_HERE, 'Your Name', true);
-- 

-- =============================================
-- Setup Complete!
-- =============================================
--
-- Next steps:
-- 1. Go to Settings > API in your Supabase dashboard
-- 2. Copy your Project URL and anon/public key
-- 3. Update js/supabase-client.js with your credentials:
--    - Replace SUPABASE_URL with your Project URL
--    - Replace SUPABASE_ANON_KEY with your anon key
--
-- Your database is now ready for the Free Viewing Task experiment!
-- =============================================
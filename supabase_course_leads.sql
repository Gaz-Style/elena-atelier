-- Migration: Course leads capture table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS course_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  course_id TEXT,
  course_name TEXT,
  current_level TEXT,  -- 'none' | 'basic' | 'intermediate' | 'advanced'
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',  -- 'new' | 'chatting' | 'enrolled' | 'handoff' | 'lost'
  chat_transcript JSONB DEFAULT '[]',
  source TEXT DEFAULT 'cursos_page',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_course_leads_status ON course_leads(status);
CREATE INDEX IF NOT EXISTS idx_course_leads_created_at ON course_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_leads_email ON course_leads(email);

-- Enable Row Level Security
ALTER TABLE course_leads ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for server-side API routes)
CREATE POLICY "Service role can manage course_leads"
  ON course_leads FOR ALL
  USING (true)
  WITH CHECK (true);

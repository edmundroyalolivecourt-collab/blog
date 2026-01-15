-- Analytics Dashboard Database Migration
-- This SQL creates the page_views table for tracking website and blog analytics

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type TEXT NOT NULL,
  page_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_id ON page_views(page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_type ON page_views(page_type);

-- Enable Row Level Security (RLS)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert page views (for tracking)
CREATE POLICY "Allow public insert on page_views" ON page_views
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to read page views (for admin dashboard)
CREATE POLICY "Allow authenticated read on page_views" ON page_views
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optional: Add comment for documentation
COMMENT ON TABLE page_views IS 'Tracks anonymous page views for analytics purposes';
COMMENT ON COLUMN page_views.page_type IS 'Type of page viewed (e.g., article, home, about)';
COMMENT ON COLUMN page_views.page_id IS 'ID of the specific page if applicable (e.g., article ID)';
COMMENT ON COLUMN page_views.viewed_at IS 'Timestamp when the page was viewed';

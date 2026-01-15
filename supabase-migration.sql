-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  read_time TEXT NOT NULL,
  published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Public can read authors" ON authors;
CREATE POLICY "Public can read authors"
  ON authors FOR SELECT
  USING (true);

-- Create policies for authenticated users (admins)
-- Create policies for authenticated users (admins) with explicit permissions
DROP POLICY IF EXISTS "Authenticated users can do everything with articles" ON articles;

CREATE POLICY "Authenticated users can select articles" ON articles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert articles" ON articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update articles" ON articles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete articles" ON articles FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can do everything with authors" ON authors;
CREATE POLICY "Authenticated users can select authors" ON authors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert authors" ON authors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update authors" ON authors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete authors" ON authors FOR DELETE USING (auth.role() = 'authenticated');

-- Insert seed authors
INSERT INTO authors (name, email, bio, avatar) VALUES
  ('Elena Fisher', 'elena@eddiebliss.com', 'Design strategist and minimalism advocate.', 'https://i.pravatar.cc/150?img=1'),
  ('Marcus Chen', 'marcus@eddiebliss.com', 'Writer focused on slow living and intentional design.', 'https://i.pravatar.cc/150?img=12'),
  ('Sarah James', 'sarah@eddiebliss.com', 'Architecture critic and urban explorer.', 'https://i.pravatar.cc/150?img=5'),
  ('Kenji Sato', 'kenji@eddiebliss.com', 'Travel writer and coffee enthusiast.', 'https://i.pravatar.cc/150?img=13'),
  ('Alex Rivera', 'alex@eddiebliss.com', 'Tech journalist covering digital nomad culture.', 'https://i.pravatar.cc/150?img=8'),
  ('Jessica Wu', 'jessica@eddiebliss.com', 'AI researcher and creative technologist.', 'https://i.pravatar.cc/150?img=9'),
  ('David Black', 'david@eddiebliss.com', 'Museum curator and cultural critic.', 'https://i.pravatar.cc/150?img=14'),
  ('Emily Blunt', 'emily@eddiebliss.com', 'Music journalist and vinyl collector.', 'https://i.pravatar.cc/150?img=10')
ON CONFLICT (email) DO NOTHING;

-- Insert seed articles
INSERT INTO articles (slug, title, excerpt, author_id, category, image, read_time, content, published) VALUES
  (
    'future-of-minimalist-design',
    'The Future of Minimalist Design in a Maximalist World',
    'Why stripping away the unnecessary is more important than ever in our digital age.',
    (SELECT id FROM authors WHERE email = 'elena@eddiebliss.com'),
    'Design',
    'https://images.unsplash.com/photo-1493514789931-586cb2db6d77?q=80&w=2940&auto=format&fit=crop',
    '6 min read',
    '<p>In a world increasingly dominated by visual noise and information overload, minimalist design has never been more relevant. This article explores the principles of minimalism and how they apply to modern digital experiences.</p><p>The core philosophy of minimalism is simple: remove everything that doesn''t serve a purpose. But in practice, this is incredibly difficult. It requires discipline, taste, and a deep understanding of what truly matters to your users.</p>',
    true
  ),
  (
    'slow-living-manifesto',
    'A Manifesto for Slow Living',
    'Reclaiming your time and attention in an economy designed to steal it.',
    (SELECT id FROM authors WHERE email = 'marcus@eddiebliss.com'),
    'Lifestyle',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2940&auto=format&fit=crop',
    '8 min read',
    '<p>The modern world is designed to keep us moving fast. But what if we chose to slow down? This manifesto explores the philosophy of slow living and how it can transform our relationship with time, work, and meaning.</p>',
    true
  ),
  (
    'architectural-harmony',
    'Finding Harmony in Concrete',
    'Exploring the brutalist architecture of 1960s London and its lasting impact.',
    (SELECT id FROM authors WHERE email = 'sarah@eddiebliss.com'),
    'Architecture',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2940&auto=format&fit=crop',
    '5 min read',
    '<p>Brutalist architecture is often misunderstood. This article takes a deep dive into the brutalist movement in 1960s London and explores why these concrete structures still matter today.</p>',
    true
  ),
  (
    'coffee-culture-tokyo',
    'The Quiet Coffee Culture of Tokyo',
    'Hidden cafes and the masters who have perfected the pour-over technique.',
    (SELECT id FROM authors WHERE email = 'kenji@eddiebliss.com'),
    'Travel',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop',
    '4 min read',
    '<p>Tokyo''s coffee culture is a study in precision and patience. This article explores the hidden cafes where masters have spent decades perfecting the art of the pour-over.</p>',
    true
  ),
  (
    'digital-nomad-gear',
    'Essential Gear for the Modern Digital Nomad',
    'A curated list of technology that makes working from anywhere not just possible, but pleasurable.',
    (SELECT id FROM authors WHERE email = 'alex@eddiebliss.com'),
    'Technology',
    'https://images.unsplash.com/photo-1593642632823-8f78536709c7?q=80&w=2940&auto=format&fit=crop',
    '7 min read',
    '<p>The digital nomad lifestyle requires the right tools. This comprehensive guide covers everything from laptops to noise-canceling headphones, helping you build the perfect remote work setup.</p>',
    true
  ),
  (
    'ai-art-revolution',
    'The AI Art Revolution: Tool or Threat?',
    'Examining the intersection of algorithmic generation and human creativity.',
    (SELECT id FROM authors WHERE email = 'jessica@eddiebliss.com'),
    'Technology',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop',
    '9 min read',
    '<p>AI-generated art is transforming the creative landscape. But is it a tool for artists or a threat to human creativity? This article explores both sides of the debate.</p>',
    true
  ),
  (
    'modern-museums',
    'Reimagining the Museum Experience',
    'How interactive installations are changing the way we engage with art and history.',
    (SELECT id FROM authors WHERE email = 'david@eddiebliss.com'),
    'Culture',
    'https://images.unsplash.com/photo-1518998053901-5348d3969105?q=80&w=2832&auto=format&fit=crop',
    '6 min read',
    '<p>Museums are evolving beyond static displays. This article examines how interactive installations and immersive experiences are redefining what it means to engage with art and history.</p>',
    true
  ),
  (
    'vinyl-revival',
    'The Tactile Renaissance: Why Vinyl Matters',
    'In an era of streaming, the physical format is making a massive comeback.',
    (SELECT id FROM authors WHERE email = 'emily@eddiebliss.com'),
    'Culture',
    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=2938&auto=format&fit=crop',
    '5 min read',
    '<p>Vinyl records are experiencing a renaissance. This article explores why physical music formats matter in an age of infinite digital streaming.</p>',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Add views and likes columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'views') THEN
        ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'likes') THEN
        ALTER TABLE articles ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$;

-- RPC to safer increment likes
CREATE OR REPLACE FUNCTION increment_likes(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles
  SET likes = likes + 1
  WHERE id = article_id;
END;
$$;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for comments
DROP POLICY IF EXISTS "Public can read comments" ON comments;
CREATE POLICY "Public can read comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create comments" ON comments;
CREATE POLICY "Public can create comments" ON comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete comments" ON comments;
CREATE POLICY "Admin can delete comments" ON comments FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for subscribers
DROP POLICY IF EXISTS "Public can subscribe" ON subscribers;
CREATE POLICY "Public can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view subscribers" ON subscribers;
CREATE POLICY "Admin can view subscribers" ON subscribers FOR SELECT USING (auth.role() = 'authenticated');

-- Storage for Images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'blog-images' );

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

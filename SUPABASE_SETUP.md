# Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Create Environment File

Create a file named `.env.local` in the project root with:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-migration.sql`
4. Paste and click **Run**

This will create:
- `authors` table with 8 seed authors
- `articles` table with 8 seed articles
- Row Level Security policies
- Indexes for performance

## Step 4: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## Step 5: Verify

Your blog should now be pulling real data from Supabase! Check:
- Home page shows articles from database
- Category pages filter correctly
- Search works with database
- Admin dashboard shows real posts

## Next Steps

- Set up authentication for admin login
- Add image upload functionality
- Create admin UI for managing posts

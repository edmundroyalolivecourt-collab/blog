import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configure dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// Priority: .env.local, .env
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const SITE_URL = process.env.VITE_SITE_URL || 'https://eddieblissblog.netlify.app'; // Use env var
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
    console.log('Generating sitemap...');

    try {
        console.log('Fetching articles from Supabase...');
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, updated_at, created_at, published, title, image')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        console.log(`Found ${articles?.length || 0} articles.`);

        const staticPages = [
            '',
            '/about',
            '/culture',
            '/tech',
            '/archive',
            '/subscribe',
            '/privacy',
            '/contact'
        ];

        const currentDate = new Date().toISOString();
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        // Static Pages
        staticPages.forEach(page => {
            xml += `
    <url>
        <loc>${SITE_URL}${page}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>`;
        });

        // Dynamic Articles
        articles?.forEach(article => {
            const lastMod = article.updated_at || article.created_at;
            const dateStr = lastMod ? new Date(lastMod).toISOString() : currentDate;
            xml += `
    <url>
        <loc>${SITE_URL}/article/${article.slug}</loc>
        <lastmod>${dateStr}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>${article.image ? `
        <image:image>
            <image:loc>${article.image.startsWith('http') ? article.image : SITE_URL + article.image}</image:loc>
            <image:title>${article.title || 'Article Image'}</image:title>
        </image:image>` : ''}
    </url>`;
        });

        xml += `
</urlset>`;

        // Ensure public directory exists
        const publicDir = path.resolve(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        // Write sitemap.xml
        const sitemapPath = path.join(publicDir, 'sitemap.xml');
        fs.writeFileSync(sitemapPath, xml);
        console.log(`✅ sitemap.xml generated successfully at ${sitemapPath}`);

        // Generate robots.txt
        const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
`;
        fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
        console.log('✅ robots.txt generated successfully in /public');

    } catch (err) {
        console.error('Failed to generate sitemap:', err);
        process.exit(1);
    }
}

generateSitemap();

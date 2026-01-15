import { createClient } from '@supabase/supabase-js';

export const handler = async (event, context) => {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
    const SITE_URL = process.env.VITE_SITE_URL || 'https://eddieblissblog.netlify.app';

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Supabase credentials missing' }),
        };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, updated_at, created_at, published, title, image')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

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

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600'
            },
            body: xml,
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};

import { supabase } from './supabase';

// Types for analytics
export interface PageView {
    id: string;
    page_type: string;
    page_id?: string;
    viewed_at: string;
    created_at: string;
}

export interface DailyViewStats {
    date: string;
    views: number;
}

export interface TopArticle {
    article_id: string;
    title: string;
    views: number;
}

export interface AnalyticsSummary {
    totalViews: number;
    totalArticles: number;
    avgViewsPerArticle: number;
    topArticles: TopArticle[];
    dailyViews: DailyViewStats[];
}

/**
 * Track a page view
 * @param pageType - Type of page ('article', 'home', 'about', etc.)
 * @param pageId - Optional ID if tracking a specific article
 */
export async function trackPageView(pageType: string, pageId?: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('page_views')
            .insert([{
                page_type: pageType,
                page_id: pageId || null,
            }]);

        if (error) {
            console.error('Error tracking page view:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error tracking page view:', error);
        return false;
    }
}

/**
 * Get overall website analytics
 * @param days - Number of days to look back (default: 30)
 */
export async function getWebsiteAnalytics(days: number = 30): Promise<AnalyticsSummary> {
    try {
        console.log('🔍 Fetching analytics for', days, 'days');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get total views in the time period
        const { count: totalViews, error: viewsError } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('viewed_at', startDate.toISOString());

        if (viewsError) {
            console.error('❌ Error fetching total views:', viewsError);
        } else {
            console.log('✅ Total views:', totalViews);
        }

        // Get daily views for charting
        const dailyViews = await getDailyViews(days);
        console.log('📊 Daily views data:', dailyViews);

        // Get top articles
        const topArticles = await getTopArticles(5, days);
        console.log('🏆 Top articles:', topArticles);

        // Get unique articles viewed
        const { data: uniqueArticles, error: articlesError } = await supabase
            .from('page_views')
            .select('page_id')
            .eq('page_type', 'article')
            .not('page_id', 'is', null)
            .gte('viewed_at', startDate.toISOString());

        if (articlesError) {
            console.error('❌ Error fetching unique articles:', articlesError);
        }

        const uniqueArticleIds = new Set(uniqueArticles?.map(v => v.page_id) || []);
        const totalArticles = uniqueArticleIds.size;
        const avgViewsPerArticle = totalArticles > 0 ? (totalViews || 0) / totalArticles : 0;

        const result = {
            totalViews: totalViews || 0,
            totalArticles,
            avgViewsPerArticle: Math.round(avgViewsPerArticle),
            topArticles,
            dailyViews,
        };

        console.log('📈 Final analytics result:', result);
        return result;
    } catch (error) {
        console.error('❌ Error fetching website analytics:', error);
        return {
            totalViews: 0,
            totalArticles: 0,
            avgViewsPerArticle: 0,
            topArticles: [],
            dailyViews: [],
        };
    }
}

/**
 * Get daily view counts for charting
 * @param days - Number of days to look back
 */
export async function getDailyViews(days: number = 30): Promise<DailyViewStats[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('page_views')
            .select('viewed_at')
            .gte('viewed_at', startDate.toISOString())
            .order('viewed_at', { ascending: true });

        if (error) {
            console.error('Error fetching daily views:', error);
            return [];
        }

        // Group by date
        const viewsByDate: Record<string, number> = {};

        data?.forEach(view => {
            const date = new Date(view.viewed_at).toISOString().split('T')[0];
            viewsByDate[date] = (viewsByDate[date] || 0) + 1;
        });

        // Fill in missing dates with 0 views
        const result: DailyViewStats[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                views: viewsByDate[dateStr] || 0,
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching daily views:', error);
        return [];
    }
}

/**
 * Get top performing articles
 * @param limit - Number of top articles to return
 * @param days - Number of days to look back
 */
export async function getTopArticles(limit: number = 5, days: number = 30): Promise<TopArticle[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get article views from page_views table
        const { data: pageViews, error: viewsError } = await supabase
            .from('page_views')
            .select('page_id')
            .eq('page_type', 'article')
            .not('page_id', 'is', null)
            .gte('viewed_at', startDate.toISOString());

        if (viewsError) {
            console.error('Error fetching article views:', viewsError);
            return [];
        }

        // Count views per article
        const viewCounts: Record<string, number> = {};
        pageViews?.forEach(view => {
            if (view.page_id) {
                viewCounts[view.page_id] = (viewCounts[view.page_id] || 0) + 1;
            }
        });

        // Get article details
        const articleIds = Object.keys(viewCounts);
        if (articleIds.length === 0) return [];

        const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('id, title')
            .in('id', articleIds);

        if (articlesError) {
            console.error('Error fetching articles:', articlesError);
            return [];
        }

        // Combine and sort
        const topArticles: TopArticle[] = articles?.map(article => ({
            article_id: article.id,
            title: article.title,
            views: viewCounts[article.id] || 0,
        })) || [];

        return topArticles
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching top articles:', error);
        return [];
    }
}

/**
 * Get blog-specific analytics
 * @param days - Number of days to look back
 */
export async function getBlogAnalytics(days: number = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { count: blogViews, error } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .eq('page_type', 'article')
            .gte('viewed_at', startDate.toISOString());

        if (error) {
            console.error('Error fetching blog analytics:', error);
            return { blogViews: 0 };
        }

        return { blogViews: blogViews || 0 };
    } catch (error) {
        console.error('Error fetching blog analytics:', error);
        return { blogViews: 0 };
    }
}

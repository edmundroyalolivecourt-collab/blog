import { supabase, type Article } from './supabase';

// Fetch all published articles
export async function getArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    return data || [];
}

// Fetch single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .eq('slug', slug)
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .single();

    if (error) {
        console.error('Error fetching article:', error);
        return null;
    }

    return data;
}

// Fetch single article by ID
export async function getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching article by id:', error);
        return null;
    }

    return data;
}

// Fetch articles by category
export async function getArticlesByCategory(category: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .eq('category', category)
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles by category:', error);
        return [];
    }

    return data || [];
}

// Fetch related articles by category
export async function getRelatedArticles(category: string, currentArticleId: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .eq('category', category)
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .neq('id', currentArticleId)
        .limit(3);

    if (error) {
        console.error('Error fetching related articles:', error);
        return [];
    }

    return data || [];
}

// Search articles
export async function searchArticles(query: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error searching articles:', error);
        return [];
    }

    return data || [];
}

// Admin: Create article
export async function createArticle(article: Partial<Article>): Promise<Article> {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        throw new Error('User not authenticated');
    }

    // 2. Find or create author profile
    let authorId: string;

    const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('email', user.email)
        .single();

    if (existingAuthor) {
        authorId = existingAuthor.id;
    } else {
        // Create new author profile
        const { data: newAuthor, error: createError } = await supabase
            .from('authors')
            .insert([{
                name: user.user_metadata?.full_name || user.email.split('@')[0],
                email: user.email,
                avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`,
                bio: 'New contributor'
            }])
            .select()
            .single();

        if (createError) {
            throw new Error(`Failed to create author profile: ${createError.message}`);
        }
        if (!newAuthor) {
            throw new Error('Failed to create author profile: No data returned');
        }
        authorId = newAuthor.id;
    }

    // 3. Create Article with correct author_id
    const { data, error } = await supabase
        .from('articles')
        .insert([{ ...article, author_id: authorId }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('An article with this title already exists. Please choose a different title.');
        }
        throw new Error(`Failed to create article: ${error.message}`);
    }

    return data;
}

// Admin: Update article
export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const { data, error } = await supabase
        .from('articles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update article: ${error.message}`);
    }

    return data;
}

// Admin: Delete article
export async function deleteArticle(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting article:', error);
        return false;
    }

    return true;
}

// Admin: Get all articles (including unpublished)
export async function getAllArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
      *,
      author:authors(*)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all articles:', error);
        return [];
    }

    return data || [];
}

// Get total comments count
export async function getCommentsCount(): Promise<number> {
    const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching comments count:', error);
        return 0;
    }

    return count || 0;
}

// Helper to toggle publish status
export async function togglePublishStatus(id: string, currentStatus: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('articles')
        .update({ published: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error('Error toggling publish status:', error);
        return false;
    }
    return true;
}

// Upload image to storage
export async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
    }

    const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// Get comments for an article
export async function getComments(articleId: string): Promise<any[]> {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return data || [];
}

// Create a comment
export async function createComment(comment: { article_id: string; author_name: string; content: string }): Promise<any | null> {
    const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        return null;
    }

    return data;
}

// Like an article
export async function likeArticle(articleId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_likes', { article_id: articleId });

    if (error) {
        console.error('Error liking article:', error);
        return false;
    }

    return true;
}

// Increment article views
export async function incrementViews(articleId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_views', { article_id: articleId });

    if (error) {
        console.error('Error incrementing views:', error);
        return false;
    }

    return true;
}

// Admin: Get Analytics Data
export async function getAnalyticsData(): Promise<{
    totalViews: number;
    totalLikes: number;
    popularArticles: Article[];
    categoryStats: { category: string; count: number }[];
}> {
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*');

    if (error) {
        console.error('Error fetching analytics articles:', error);
        return { totalViews: 0, totalLikes: 0, popularArticles: [], categoryStats: [] };
    }

    const totalViews = articles.reduce((acc, art) => acc + (art.views || 0), 0);
    const totalLikes = articles.reduce((acc, art) => acc + (art.likes || 0), 0);

    const popularArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

    const categoriesMap: Record<string, number> = {};
    articles.forEach(art => {
        categoriesMap[art.category] = (categoriesMap[art.category] || 0) + 1;
    });

    const categoryStats = Object.entries(categoriesMap).map(([category, count]) => ({ category, count }));

    return { totalViews, totalLikes, popularArticles, categoryStats };
}

// Admin: Get all comments
export async function getAllComments(): Promise<any[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            article:articles(title, slug)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all comments:', error);
        return [];
    }

    return data || [];
}

// Admin: Delete a comment
export async function deleteComment(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting comment:', error);
        return false;
    }

    return true;
}

// Admin: Get all subscribers
export async function getSubscribers(): Promise<any[]> {
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching subscribers:', error);
        return [];
    }

    return data || [];
}

// Admin: Get all authors
export async function getAuthors(): Promise<any[]> {
    const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching authors:', error);
        return [];
    }
    return data || [];
}

// Admin: Update author
export async function updateAuthor(id: string, updates: any): Promise<boolean> {
    const { error } = await supabase
        .from('authors')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating author:', error);
        return false;
    }
    return true;
}

// Admin: Update User Credentials (Email, Password, Metadata)
export async function updateUserCredentials(attributes: { email?: string; password?: string; data?: { full_name?: string } }): Promise<{ success: boolean; message?: string }> {
    const { error } = await supabase.auth.updateUser(attributes);

    if (error) {
        console.error('Error updating user:', error);
        return { success: false, message: error.message };
    }
    return { success: true };
}

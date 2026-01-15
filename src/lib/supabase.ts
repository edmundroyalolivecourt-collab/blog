import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Author {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    created_at: string;
}

export interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author_id: string;
    category: string;
    image: string;
    read_time: string;
    published: boolean;
    published_at: string;
    created_at: string;
    updated_at: string;
    views?: number;
    likes?: number;
    author?: Author;
}

export interface Comment {
    id: string;
    article_id: string;
    author_name: string;
    content: string;
    created_at: string;
}

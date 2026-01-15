import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Share2, Heart, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArticleBySlug, getComments, createComment, likeArticle, incrementViews, getRelatedArticles } from '../lib/api';
import { trackPageView } from '../lib/analytics';
import type { Article as ArticleType, Comment } from '../lib/supabase';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import LazyImage from '../components/LazyImage';
import ShareButtons from '../components/ShareButtons';
import ReadingProgress from '../components/ReadingProgress';

export default function Article() {
    const { slug } = useParams();
    const [article, setArticle] = useState<ArticleType | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    // Comment Form State
    const [commentContent, setCommentContent] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (slug) {
                const articleData = await getArticleBySlug(slug);
                if (articleData) {
                    setArticle(articleData);
                    setLikeCount(articleData.likes || 0);

                    // Increment views
                    incrementViews(articleData.id);

                    // Track page view for analytics
                    trackPageView('article', articleData.id);

                    // Fetch comments
                    const commentsData = await getComments(articleData.id);
                    setComments(commentsData);

                    // Fetch related articles
                    const related = await getRelatedArticles(articleData.category, articleData.id);
                    setRelatedArticles(related);
                }
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    const handleLike = async () => {
        if (!article || isLiked) return;

        // Optimistic update
        setLikeCount(prev => prev + 1);
        setIsLiked(true);

        const success = await likeArticle(article.id);
        if (!success) {
            // Revert if failed
            setLikeCount(prev => prev - 1);
            setIsLiked(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!article || !commentContent.trim() || !authorName.trim()) return;

        setIsSubmittingComment(true);
        const newComment = {
            article_id: article.id,
            author_name: authorName,
            content: commentContent
        };

        const result = await createComment(newComment);
        if (result) {
            setComments([result, ...comments]);
            setCommentContent('');
            setAuthorName('');
        } else {
            alert('Failed to post comment.');
        }
        setIsSubmittingComment(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 md:px-12 py-20 text-center">
                <p className="text-muted-foreground animate-pulse">Loading article...</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="container mx-auto px-6 md:px-12 py-20 text-center">
                <h1 className="text-4xl font-serif font-bold mb-4">Article Not Found</h1>
                <Link to="/" className="text-accent hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-background pb-20">
            <ReadingProgress />
            {article && (
                <SEO
                    title={article.title}
                    description={article.excerpt}
                    image={article.image}
                    type="article"
                    author={article.author?.name}
                    publishedTime={article.created_at}
                    keywords={[article.category, 'blog', 'article', article.title.split(' ').slice(0, 3).join(' ')]}
                    breadcrumbs={[
                        { name: article.category, url: `/${article.category.toLowerCase()}` },
                        { name: article.title, url: `/article/${article.slug}` }
                    ]}
                />
            )}
            {/* Article Header */}
            <div className="container mx-auto px-6 md:px-12 pt-10 md:pt-20">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumbs */}
                    {article && (
                        <Breadcrumbs
                            items={[
                                { name: article.category, url: `/${article.category.toLowerCase()}` },
                                { name: article.title, url: `/article/${article.slug}` }
                            ]}
                        />
                    )}
                </div>
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center space-x-2 mb-6"
                    >
                        <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest rounded-full">
                            {article.category}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                            {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 text-primary"
                        dangerouslySetInnerHTML={{ __html: article.title }}
                    />

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light"
                    >
                        {article.excerpt}
                    </motion.p>
                </div>

                {/* Author & Actions Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between border-y border-border py-6 mb-12 gap-6"
                >
                    <div className="flex items-center space-x-4">
                        <img
                            src={article.author?.avatar || 'https://i.pravatar.cc/150'}
                            alt={article.author?.name || 'Author'}
                            className="w-12 h-12 rounded-full object-cover border border-border"
                        />
                        <div className="text-left">
                            <p className="font-bold text-sm">{article.author?.name || 'Unknown Author'}</p>
                            <p className="text-xs text-muted-foreground">{article.author?.bio || 'Writer'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-muted-foreground">
                        <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            {article.read_time || `${Math.ceil(article.content.split(/\s+/).length / 200)} min read`}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                                aria-label="Share"
                                title="Copy Link"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleLike}
                                className={`p-2 rounded-full transition-colors flex items-center gap-2 ${isLiked ? 'text-red-500 bg-red-50' : 'hover:bg-secondary'}`}
                                aria-label="Like"
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-xs font-bold">{likeCount}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative aspect-[21/9] max-w-3xl mx-auto overflow-hidden rounded-2xl mb-16 shadow-lg"
                >
                    <LazyImage
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Article Content */}
                <div className="max-w-[680px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-lg md:prose-xl prose-stone dark:prose-invert font-serif"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Social Share Section */}
                    <ShareButtons
                        url={window.location.href}
                        title={article.title}
                        image={article.image}
                    />
                </div>

                {/* Comments Section */}
                <div className="max-w-[680px] mx-auto mt-20 pt-10 border-t border-border">
                    <h3 className="text-2xl font-bold font-serif mb-8 flex items-center gap-3">
                        <MessageCircle className="w-6 h-6" />
                        Comments ({comments.length})
                    </h3>

                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="mb-12 bg-secondary/30 p-6 rounded-2xl">
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Name</label>
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/20"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Comment</label>
                            <textarea
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 h-24 resize-none"
                                placeholder="Share your thoughts..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmittingComment}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            Post Comment
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        <AnimatePresence>
                            {comments.map((comment) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-background border border-border p-6 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs uppercase">
                                                {comment.author_name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-sm">{comment.author_name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{comment.content}</p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {comments.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <div className="max-w-4xl mx-auto mt-20 pt-20 border-t border-border">
                    <h3 className="text-2xl font-bold font-serif mb-8 text-center">More from {article.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedArticles.map((rel) => (
                            <Link
                                key={rel.id}
                                to={`/article/${rel.slug}`}
                                className="group block"
                            >
                                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img
                                        src={rel.image}
                                        alt={rel.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h4 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2">{rel.title}</h4>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}

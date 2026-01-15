import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getArticles } from '../lib/api';
import { trackPageView } from '../lib/analytics';
import type { Article } from '../lib/supabase';
import SEO from '../components/SEO';
import LazyImage from '../components/LazyImage';

/* Local constant removed in favor of shared data */

export default function Home() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticles() {
            const data = await getArticles();
            if (data.length > 0) {
                setFeaturedArticle(data[0]);
                setArticles(data.slice(1, 5)); // Show next 4 articles in grid
            }
            setLoading(false);
        }
        fetchArticles();

        // Track home page view
        trackPageView('home');
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-6 md:px-12 py-20 text-center">
                <p className="text-muted-foreground">Loading articles...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 md:px-12 pb-20">
            <SEO
                title="Eddie Bliss"
                description="Explore the latest in design, culture, and technology. A curated collection of thoughtful perspectives by Eddie Bliss."
                keywords={['blog', 'design', 'technology', 'culture', 'Eddie Bliss', 'articles', 'writing']}
            />
            {/* Hero Section */}
            {featuredArticle && (
                <section className="min-h-[60vh] flex flex-col justify-center py-12 md:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:col-span-7 order-2 lg:order-1"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="w-8 h-[1px] bg-accent"></span>
                                <span className="text-sm font-medium tracking-widest uppercase text-accent">Featured Story</span>
                            </div>
                            <h1
                                className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-primary"
                                dangerouslySetInnerHTML={{ __html: featuredArticle.title }}
                            />
                            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                                {featuredArticle.excerpt}
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    to={`/article/${featuredArticle.slug}`}
                                    className="group relative inline-flex items-center px-8 py-4 bg-primary text-primary-foreground overflow-hidden rounded-full transition-all hover:bg-accent"
                                >
                                    <span className="relative z-10 font-medium tracking-wide mr-2">Read Full Story</span>
                                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {featuredArticle.read_time || `${Math.ceil((featuredArticle.content || '').split(/\s+/).length / 200)} min read`}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="lg:col-span-5 order-1 lg:order-2 relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] max-h-[500px]"
                        >
                            <div className="absolute inset-0 bg-secondary rounded-2xl overflow-hidden shadow-2xl">
                                <LazyImage
                                    src={featuredArticle.image}
                                    alt={featuredArticle.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Editor's Picks Grid */}
            <section className="py-20 border-t border-border">
                <div className="flex items-end justify-between mb-16">
                    <div>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Latest Stories</h2>
                        <p className="text-muted-foreground">Curated perspectives on design and culture.</p>
                    </div>
                    <Link to="/archive" className="hidden md:flex items-center text-sm font-medium hover:text-accent transition-colors">
                        View Archive <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                    {articles.map((article, index) => (
                        <motion.article
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <Link to={`/article/${article.slug}`}>
                                <div className="overflow-hidden rounded-xl mb-6 aspect-[16/10] bg-secondary relative">
                                    <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full z-10">
                                        {article.category}
                                    </span>
                                    <LazyImage
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-xs font-medium text-muted-foreground space-x-3">
                                        <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {article.author?.name || 'Unknown'}</span>
                                        <span className="w-1 h-1 bg-border rounded-full"></span>
                                        <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <h3
                                        className="font-serif text-2xl md:text-3xl font-bold leading-tight group-hover:text-accent transition-colors"
                                        dangerouslySetInnerHTML={{ __html: article.title }}
                                    />
                                    <p className="text-muted-foreground line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                    <div className="pt-2 flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                                        Read Story <ArrowRight className="w-3 h-3 ml-2" />
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-16 text-center md:hidden">
                    <Link to="/archive" className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors">
                        View Archive <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 md:py-32">
                <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-20 text-center relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="text-accent text-sm font-bold tracking-widest uppercase mb-4 block">Weekly Digest</span>
                        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Join 40,000+ creative minds</h2>
                        <p className="text-primary-foreground/70 mb-10 text-lg">
                            Get our weekly dispatch on design, technology, and culture delivered straight to your inbox every Sunday morning.
                        </p>
                        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 px-6 py-4 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button className="px-8 py-4 bg-accent text-white font-bold rounded-full hover:bg-accent/90 transition-colors">
                                Subscribe
                            </button>
                        </form>
                        <p className="mt-6 text-xs text-primary-foreground/40">
                            No spam, ever. Unsubscribe at any time.
                        </p>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>
            </section>
        </div>
    );
}

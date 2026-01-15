import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Instagram, Twitter, Linkedin, LogIn, Sun, Moon } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { searchArticles } from './lib/api';
import type { Article } from './lib/supabase';

interface BlogLayoutProps {
    children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Article[]>([]);
    const [searching, setSearching] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Search effect
    useEffect(() => {
        async function performSearch() {
            if (searchQuery.length > 0) {
                setSearching(true);
                const results = await searchArticles(searchQuery);
                setSearchResults(results);
                setSearching(false);
            } else {
                setSearchResults([]);
            }
        }
        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Location change effect
    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        window.scrollTo(0, 0);
    }, [location]);

    // Dark mode effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20 selection:text-accent-foreground">
            {/* Navigation */}
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent",
                    scrolled ? "bg-background/80 backdrop-blur-md border-border/40 py-4" : "bg-transparent py-6"
                )}
            >
                <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                    <Link to="/" className="relative z-50 group">
                        <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
                            EddieBlissBlog<span className="text-accent">.</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide text-muted-foreground">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 hover:bg-secondary rounded-full transition-colors text-foreground"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button
                            className="p-2 hover:bg-secondary rounded-full transition-colors text-foreground"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        <Link
                            to="/subscribe"
                            className="px-5 py-2.5 bg-foreground text-background rounded-full hover:bg-accent hover:text-white transition-all duration-300"
                        >
                            Subscribe
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden relative z-50 p-2 text-foreground"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl p-6 md:p-12 flex flex-col"
                    >
                        <button
                            className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="max-w-3xl mx-auto w-full mt-20">
                            <input
                                type="text"
                                placeholder="Search stories, topics, & more..."
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-3xl md:text-5xl font-serif font-bold bg-transparent border-b-2 border-border focus:border-accent focus:outline-none pb-4 placeholder:text-muted-foreground/30"
                            />

                            <div className="mt-12 space-y-8 overflow-y-auto max-h-[60vh]">
                                {searching ? (
                                    <p className="text-muted-foreground text-lg">Searching...</p>
                                ) : searchQuery.length > 0 ? (
                                    searchResults.length > 0 ? (
                                        searchResults.map((article: Article) => (
                                            <Link key={article.id} to={`/article/${article.slug}`} className="block group border-b border-border/50 pb-6">
                                                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">{article.category}</span>
                                                <h3 className="text-2xl font-serif font-bold group-hover:text-accent transition-colors">{article.title}</h3>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-lg">No stories found for "{searchQuery}"</p>
                                    )
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['AI', 'Crypto', 'Money', 'Marketing', 'Sports', 'News', 'Technology', 'Business'].map(tag => (
                                            <button key={tag} onClick={() => setSearchQuery(tag)} className="text-left p-4 bg-secondary/30 hover:bg-secondary rounded-lg transition-colors">
                                                <span className="font-bold block mb-1">{tag}</span>
                                                <span className="text-xs text-muted-foreground">Explore category</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col space-y-6 text-2xl font-serif font-medium">
                            <Link to="/" className="border-b border-border pb-4">Journal</Link>
                            <Link to="/about" className="border-b border-border pb-4">About</Link>
                            <Link to="/culture" className="border-b border-border pb-4">Culture</Link>
                            <Link to="/tech" className="border-b border-border pb-4">Technology</Link>
                            <Link to="/subscribe" className="text-accent">Subscribe</Link>
                            <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }} className="text-left text-muted-foreground flex items-center gap-2">
                                <Search className="w-5 h-5" /> Search
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-24 min-h-[calc(100vh-300px)]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-secondary/30 pt-20 pb-10 mt-20 border-t border-border">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-2">
                            <span className="font-serif text-2xl font-bold block mb-6">
                                EddieBlissBlog<span className="text-accent">.</span>
                            </span>
                            <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
                                A digital publication dedicated to the art of modern living, technology, and thoughtful design. Curated for the curious mind.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="p-2 bg-background border border-border rounded-full hover:border-accent hover:text-accent transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a href="#" className="p-2 bg-background border border-border rounded-full hover:border-accent hover:text-accent transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="#" className="p-2 bg-background border border-border rounded-full hover:border-accent hover:text-accent transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Explore</h4>
                            <ul className="space-y-4 text-muted-foreground text-sm">
                                <li><Link to="/tech" className="hover:text-accent transition-colors">AI & Technology</Link></li>
                                <li><Link to="/money" className="hover:text-accent transition-colors">Make Money Online</Link></li>
                                <li><Link to="/crypto" className="hover:text-accent transition-colors">Crypto & Web3</Link></li>
                                <li><Link to="/marketing" className="hover:text-accent transition-colors">Digital Marketing</Link></li>
                                <li><Link to="/social" className="hover:text-accent transition-colors">Social Media</Link></li>
                                <li><Link to="/sports" className="hover:text-accent transition-colors">Sports</Link></li>
                                <li><Link to="/news" className="hover:text-accent transition-colors">World News</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Info</h4>
                            <ul className="space-y-4 text-muted-foreground text-sm">
                                <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                                <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
                                <li className="pt-4">
                                    <Link to="/login" className="flex items-center gap-2 hover:text-accent transition-colors opacity-70 hover:opacity-100">
                                        <LogIn className="w-3 h-3" /> Admin Login
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} EddieBlissBlog. All rights reserved.</p>
                        <p className="mt-2 md:mt-0">Designed with precision.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default BlogLayout;

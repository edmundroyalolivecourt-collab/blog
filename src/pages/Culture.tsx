import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ARTICLES } from '../lib/data';
import { ArrowRight, User } from 'lucide-react';

export default function Culture() {
    const cultureArticles = ARTICLES.filter(a => a.category === 'Culture');

    return (
        <div className="container mx-auto px-6 md:px-12 py-20">
            <div className="mb-16">
                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">Culture</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    The art, music, and movements defining our era. Deep dives into the human experience.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {cultureArticles.map((article, index) => (
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
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center text-xs font-medium text-muted-foreground space-x-3">
                                    <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {article.author}</span>
                                    <span className="w-1 h-1 bg-border rounded-full"></span>
                                    <span>{article.date}</span>
                                </div>
                                <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight group-hover:text-accent transition-colors">
                                    {article.title}
                                </h3>
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
        </div>
    );
}

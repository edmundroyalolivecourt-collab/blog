import { ARTICLES } from '../lib/data';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Archive() {
    return (
        <div className="container mx-auto px-6 md:px-12 py-20">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-16">Archive</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ARTICLES.map((article, index) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link to={`/article/${article.slug}`} className="group block">
                            <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-accent transition-colors">{article.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{article.date}</p>
                            <span className="text-xs uppercase tracking-wider font-bold text-accent group-hover:underline flex items-center">
                                Read <ArrowRight className="w-3 h-3 ml-1" />
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

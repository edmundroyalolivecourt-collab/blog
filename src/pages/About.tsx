import { motion } from 'framer-motion';

export default function About() {
    return (
        <div className="container mx-auto px-6 md:px-12 py-20 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="text-center space-y-6">
                    <h1 className="font-serif text-5xl md:text-6xl font-bold">We tell stories that matter.</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        EddieBlissBlog is a digital publication dedicated to the intersection of design, technology, and modern culture.
                    </p>
                </div>

                <div className="aspect-[21/9] bg-secondary rounded-2xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop" alt="Team" className="w-full h-full object-cover" />
                </div>

                <div className="prose prose-lg prose-stone dark:prose-invert mx-auto font-serif">
                    <p>
                        Founded in 2023, our mission is to cut through the noise of the internet. We believe in quality over quantity, slow journalism over clickbait, and thoughtful analysis over hot takes.
                    </p>
                    <p>
                        Our team of writers, designers, and thinkers are obsessed with finding the signal in the static. Whether it's the latest development in AI, a hidden architectural gem in Tokyo, or a deep dive into the philosophy of minimalism, we approach every subject with curiosity and rigor.
                    </p>
                    <h3>Our Values</h3>
                    <ul>
                        <li><strong>Integrity:</strong> We fact-check, we verify, and we stand by our words.</li>
                        <li><strong>Aesthetics:</strong> We believe beauty is a function, not just a decoration.</li>
                        <li><strong>Clarity:</strong> Complexity shouldn't be confusing. We make the hard stuff simple.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}

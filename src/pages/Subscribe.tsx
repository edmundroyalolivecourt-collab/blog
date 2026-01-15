import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function Subscribe() {
    return (
        <div className="container mx-auto px-6 md:px-12 py-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">Invest in your mind.</h1>
                <p className="text-xl text-muted-foreground">
                    Join 40,000+ creative minds getting our weekly dispatch on design, technology, and culture.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Tier */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-2xl border border-border bg-card"
                >
                    <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Free</span>
                    <div className="mt-4 mb-8">
                        <span className="text-4xl font-serif font-bold">$0</span>
                        <span className="text-muted-foreground">/forever</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Weekly Sunday Newsletter</li>
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Access to limited archive</li>
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Community comments</li>
                    </ul>
                    <button className="w-full py-3 px-4 rounded-full border border-foreground font-medium hover:bg-secondary transition-colors">
                        Sign Up Free
                    </button>
                </motion.div>

                {/* Pro Tier */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-bl-xl">Popular</div>
                    <span className="text-sm font-bold tracking-widest uppercase text-primary-foreground/70">Member</span>
                    <div className="mt-4 mb-8">
                        <span className="text-4xl font-serif font-bold">$9</span>
                        <span className="text-primary-foreground/70">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Everything in Free</li>
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Unlimited access to all stories</li>
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Deep-dive monthly reports</li>
                        <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-accent shrink-0" /> Ad-free experience</li>
                    </ul>
                    <button className="w-full py-3 px-4 rounded-full bg-accent text-white font-medium hover:bg-accent/90 transition-colors">
                        Become a Member
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

import { motion } from 'framer-motion';

export default function Contact() {
    return (
        <div className="container mx-auto px-6 md:px-12 py-20 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h1 className="font-serif text-5xl font-bold mb-6">Get in touch.</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Have a story tip? Want to partner with us? Or just want to say hi? We'd love to hear from you.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold">General Inquiries</h3>
                            <p className="text-muted-foreground">hello@eddiebliss.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold">Press & Partnerships</h3>
                            <p className="text-muted-foreground">partners@eddiebliss.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold">Office</h3>
                            <p className="text-muted-foreground">123 Design District<br />New York, NY 10012</p>
                        </div>
                    </div>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-secondary/30 p-8 rounded-2xl"
                    onSubmit={(e) => e.preventDefault()} // Prevent reload
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input type="text" className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input type="email" className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent min-h-[150px]" placeholder="Tell us something..." />
                    </div>
                    <button type="submit" className="w-full py-3 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-colors">
                        Send Message
                    </button>
                </motion.form>
            </div>
        </div>
    );
}

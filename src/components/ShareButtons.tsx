import React from 'react';
import {
    Facebook,
    Twitter,
    Linkedin,
    Mail,
    Printer,
    Share2,
    MessageCircle,
    ExternalLink,
    Instagram
} from 'lucide-react';

interface ShareButtonsProps {
    url: string;
    title: string;
    image?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, image }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedImage = image ? encodeURIComponent(image) : '';

    const shareLinks = [
        { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'hover:bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { name: 'X', icon: <Twitter className="w-4 h-4" />, color: 'hover:bg-black', url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
        { name: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: 'hover:bg-pink-600', url: `https://www.instagram.com/` },
        { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'hover:bg-blue-700', url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}` },
        { name: 'Pinterest', icon: <Share2 className="w-4 h-4" />, color: 'hover:bg-red-600', url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}` },
        { name: 'Telegram', icon: <MessageCircle className="w-4 h-4" />, color: 'hover:bg-blue-400', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
        { name: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, color: 'hover:bg-green-500', url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` },
        { name: 'Reddit', icon: <ExternalLink className="w-4 h-4" />, color: 'hover:bg-orange-600', url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
        { name: 'Tumblr', icon: <Share2 className="w-4 h-4" />, color: 'hover:bg-slate-800', url: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedTitle}` },
        { name: 'Pocket', icon: <ExternalLink className="w-4 h-4" />, color: 'hover:bg-red-400', url: `https://getpocket.com/save?url=${encodedUrl}&title=${encodedTitle}` },
        { name: 'Threads', icon: <Twitter className="w-4 h-4" />, color: 'hover:bg-black', url: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}` },
        { name: 'Mastodon', icon: <MessageCircle className="w-4 h-4" />, color: 'hover:bg-purple-600', url: `https://mastodonshare.com/?url=${encodedUrl}&text=${encodedTitle}` },
        { name: 'Nextdoor', icon: <ExternalLink className="w-4 h-4" />, color: 'hover:bg-green-600', url: `https://nextdoor.com/news_feed/?v=5&session_id=1&post_url=${encodedUrl}` },
        { name: 'Bluesky', icon: <Share2 className="w-4 h-4" />, color: 'hover:bg-blue-400', url: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}` },
        { name: 'Print', icon: <Printer className="w-4 h-4" />, color: 'hover:bg-gray-600', onClick: () => window.print() },
        { name: 'Email', icon: <Mail className="w-4 h-4" />, color: 'hover:bg-red-500', url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
    ];

    return (
        <div className="py-8 border-t border-b border-gray-100 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                Share This Post To Your Friends, Don't Be Stingy <span className="text-xl">🙂</span>
            </h3>

            <div className="flex flex-wrap gap-3">
                {shareLinks.map((platform) => (
                    platform.url ? (
                        <a
                            key={platform.name}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 transition-all ${platform.color} hover:text-white hover:border-transparent`}
                        >
                            {platform.icon}
                            {platform.name}
                        </a>
                    ) : (
                        <button
                            key={platform.name}
                            onClick={platform.onClick}
                            className={`flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 transition-all ${platform.color} hover:text-white hover:border-transparent`}
                        >
                            {platform.icon}
                            {platform.name}
                        </button>
                    )
                ))}
            </div>
        </div>
    );
};

export default ShareButtons;

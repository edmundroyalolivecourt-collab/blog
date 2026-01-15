import { Helmet } from 'react-helmet-async';

interface FAQItem {
    question: string;
    answer: string;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
    keywords?: string[];
    faqs?: FAQItem[];
    breadcrumbs?: BreadcrumbItem[];
    language?: string;
}

export default function SEO({
    title,
    description = "A comprehensive blog about technology, culture, and life.",
    canonical,
    image,
    type = 'website',
    publishedTime,
    author,
    keywords = [],
    faqs = [],
    breadcrumbs = [],
    language = 'en'
}: SEOProps) {
    const siteUrl = window.location.origin;
    const fullUrl = canonical || window.location.href;
    const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/og-default.jpg`;

    const baseTitle = "Eddie Bliss";
    const fullTitle = title === baseTitle ? title : `${title} | ${baseTitle}`;

    // JSON-LD Structured Data
    const articleSchema = type === 'article' ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "image": [fullImage],
        "datePublished": publishedTime,
        "author": [{
            "@type": "Person",
            "name": author || "Eddie Bliss"
        }],
        "description": description,
        "inLanguage": language
    } : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": baseTitle,
        "url": siteUrl,
        "description": description,
        "inLanguage": language
    };

    // FAQ Schema
    const faqSchema = faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    // Breadcrumb Schema
    const breadcrumbSchema = breadcrumbs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
        }))
    } : null;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
            {author && <meta name="author" content={author} />}
            <meta name="language" content={language} />
            <meta name="theme-color" content="#0f172a" />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:locale" content={language === 'en' ? 'en_US' : language} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data - Article/Website */}
            <script type="application/ld+json">
                {JSON.stringify(articleSchema)}
            </script>

            {/* Structured Data - FAQ */}
            {faqSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            )}

            {/* Structured Data - Breadcrumbs */}
            {breadcrumbSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            )}
        </Helmet>
    );
}

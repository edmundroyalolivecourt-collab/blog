import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    // Always include Home as the first item
    const allItems: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        ...items
    ];

    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1;
                    const isHome = index === 0;

                    return (
                        <li key={item.url} className="flex items-center gap-2">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            )}
                            {isLast ? (
                                <span className="font-medium text-slate-900" aria-current="page">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    to={item.url}
                                    className="hover:text-accent transition-colors flex items-center gap-1"
                                >
                                    {isHome && <Home className="w-4 h-4" />}
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

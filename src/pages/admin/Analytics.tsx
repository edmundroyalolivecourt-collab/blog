import { useState, useEffect } from 'react';
import { Eye, Heart, BarChart2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAnalyticsData } from '../../lib/api';
import type { Article } from '../../lib/supabase';

interface AnalyticsStats {
    totalViews: number;
    totalLikes: number;
    popularArticles: Article[];
    categoryStats: { category: string; count: number }[];
}

export default function Analytics() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const data = await getAnalyticsData();
            setStats(data);
            setLoading(false);
        }
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif font-bold text-slate-900">Analytics</h1>
                <p className="text-slate-500">Track your blog's performance and audience engagement.</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Views"
                    value={stats?.totalViews || 0}
                    icon={<Eye className="w-5 h-5" />}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Total Likes"
                    value={stats?.totalLikes || 0}
                    icon={<Heart className="w-5 h-5" />}
                    color="bg-red-50 text-red-600"
                />
                <StatCard
                    title="Active Posts"
                    value={stats?.popularArticles.length || 0}
                    icon={<BarChart2 className="w-5 h-5" />}
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    title="Avg. Engagement"
                    value={stats?.totalViews ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1) + '%' : '0%'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="bg-green-50 text-green-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Popular Articles */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Popular Stories
                    </h3>
                    <div className="space-y-4">
                        {stats?.popularArticles.map((article, index) => (
                            <div key={article.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-slate-400 w-4">#{index + 1}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900 line-clamp-1">{article.title}</h4>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{article.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{article.views || 0}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Views</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{article.likes || 0}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Likes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Content Categories</h3>
                    <div className="space-y-4">
                        {stats?.categoryStats.map((cat) => (
                            <div key={cat.category} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{cat.category}</span>
                                    <span className="text-slate-500">{cat.count} posts</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cat.count / (stats.popularArticles.length || 1)) * 100}%` }}
                                        className="h-full bg-accent"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    {icon}
                </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</h4>
        </div>
    );
}

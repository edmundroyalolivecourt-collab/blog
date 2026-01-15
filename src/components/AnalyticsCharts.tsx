import { Eye, BarChart3, TrendingUp } from 'lucide-react';
import type { DailyViewStats, TopArticle } from '../lib/analytics';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
}

export function StatsCard({ title, value, icon, trend, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
                    {trend && (
                        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface ViewsOverTimeChartProps {
    data: DailyViewStats[];
}

export function ViewsOverTimeChart({ data }: ViewsOverTimeChartProps) {
    if (!data || data.length === 0) {
        return <div className="bg-white rounded-2xl p-8 border border-gray-100 h-[400px] flex items-center justify-center text-slate-400">No data available for time chart</div>;
    }

    const maxViews = Math.max(...data.map(d => d.views), 1);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Views Over Time</h3>
                    <p className="text-sm text-slate-500 mt-1">Daily page view trends</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
            </div>

            <div className="flex items-end justify-between h-[250px] gap-1 px-2">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div
                            className="w-full bg-blue-500/10 group-hover:bg-blue-500/30 transition-all rounded-t-sm relative"
                            style={{ height: `${(item.views / maxViews) * 100}%`, minHeight: '2px' }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {item.views} views
                            </div>
                        </div>
                        {i % 5 === 0 && (
                            <span className="text-[10px] text-slate-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface TopArticlesChartProps {
    data: TopArticle[];
}

export function TopArticlesChart({ data }: TopArticlesChartProps) {
    if (!data || data.length === 0) {
        return <div className="bg-white rounded-2xl p-8 border border-gray-100 h-[400px] flex items-center justify-center text-slate-400">No data available for top articles</div>;
    }

    const maxViews = Math.max(...data.map(d => d.views), 1);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Top Performing Articles</h3>
                    <p className="text-sm text-slate-500 mt-1">Most viewed blog posts</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                    <Eye className="w-5 h-5 text-purple-600" />
                </div>
            </div>

            <div className="space-y-4">
                {data.map((item, i) => (
                    <div key={i} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[70%]">{item.title}</span>
                            <span className="text-sm font-bold text-slate-900">{item.views.toLocaleString()} views</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 group-hover:bg-purple-600 transition-all rounded-full"
                                style={{ width: `${(item.views / maxViews) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

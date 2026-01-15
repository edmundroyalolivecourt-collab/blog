import React, { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    Edit,
    Globe,
    Clock,
    Eye,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllArticles, deleteArticle, togglePublishStatus } from '../../lib/api';
import { getWebsiteAnalytics, type AnalyticsSummary } from '../../lib/analytics';
import { StatsCard, ViewsOverTimeChart, TopArticlesChart } from '../../components/AnalyticsCharts';
import type { Article } from '../../lib/supabase';

export default function Dashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');

    // Analytics state
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<7 | 30 | 90 | 365>(30);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllArticles();
            setArticles(data);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const data = await getWebsiteAnalytics(timeRange);
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const success = await deleteArticle(id);
            if (success) {
                setArticles(articles.filter(a => a.id !== id));
            }
        }
    };

    const handleTogglePublish = async (e: React.MouseEvent, article: Article) => {
        e.stopPropagation(); // Prevent row click
        const newStatus = !article.published;
        const success = await togglePublishStatus(article.id, article.published);
        if (success) {
            setArticles(articles.map(a => a.id === article.id ? { ...a, published: newStatus } : a));
        }
    };

    useEffect(() => {
        let filtered = [...articles];
        const now = new Date().toISOString();
        if (statusFilter === 'published') {
            filtered = articles.filter(a => a.published && a.published_at <= now);
        } else if (statusFilter === 'draft') {
            filtered = articles.filter(a => !a.published);
        } else if (statusFilter === 'scheduled') {
            filtered = articles.filter(a => a.published && a.published_at > now);
        }
        setFilteredArticles(filtered);
    }, [statusFilter, articles]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse text-xl font-medium text-slate-400">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your blog today.</p>
                </div>
                <Link to="/admin/editor">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                        <Plus className="w-5 h-5" />
                        New Post
                    </button>
                </Link>
            </div>

            {/* Analytics Section */}
            <div className="space-y-6">
                {/* Time Range Selector */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Analytics</h2>
                    <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                        {[
                            { label: '7 Days', value: 7 },
                            { label: '30 Days', value: 30 },
                            { label: '90 Days', value: 90 },
                            { label: 'All Time', value: 365 },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value as 7 | 30 | 90 | 365)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${timeRange === option.value
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                {analyticsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                                <div className="h-20"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Views"
                            value={analytics?.totalViews || 0}
                            icon={<Eye className="w-6 h-6" />}
                            color="blue"
                        />
                        <StatsCard
                            title="Articles Viewed"
                            value={analytics?.totalArticles || 0}
                            icon={<FileText className="w-6 h-6" />}
                            color="purple"
                        />
                        <StatsCard
                            title="Avg Views/Article"
                            value={analytics?.avgViewsPerArticle || 0}
                            icon={<TrendingUp className="w-6 h-6" />}
                            color="green"
                        />
                        <StatsCard
                            title="Total Articles"
                            value={articles.length}
                            icon={<Users className="w-6 h-6" />}
                            color="orange"
                        />
                    </div>
                )}

                {/* Charts */}
                {analyticsLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
                            <div className="h-[300px]"></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
                            <div className="h-[300px]"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ViewsOverTimeChart data={analytics?.dailyViews || []} />
                        <TopArticlesChart data={analytics?.topArticles || []} />
                    </div>
                )}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
                {(['all', 'published', 'scheduled', 'draft'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`pb-4 px-4 text-sm font-bold capitalize transition-all border-b-2 ${statusFilter === tab
                            ? 'text-blue-600 border-blue-600'
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Articles Management</h2>
                    <p className="text-sm text-slate-400">{filteredArticles.length} stories found</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Views</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredArticles.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div>
                                            <span className="block font-bold text-slate-900">{post.title}</span>
                                            <span className="text-xs text-slate-500">{post.author?.name || 'Unknown Author'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500">{post.category}</td>
                                    <td className="px-8 py-5">
                                        <button
                                            onClick={(e) => handleTogglePublish(e, post)}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${!post.published
                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                : new Date(post.published_at) > new Date()
                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}>
                                            {!post.published ? 'Draft' : new Date(post.published_at) > new Date() ? (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Scheduled
                                                </span>
                                            ) : 'Published'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-700">{post.views || 0}</td>
                                    <td className="px-8 py-5 text-sm text-slate-500">{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/article/${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                                <Globe className="w-4 h-4" />
                                            </Link>
                                            <Link to={`/admin/editor/${post.id}`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

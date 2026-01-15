import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    BarChart2,
    Users,
    Settings,
    Search,
    Bell,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
            if (user) {
                // Fetch profile
                const { data: profile } = await import('../lib/supabase').then(m => m.supabase
                    .from('authors')
                    .select('*')
                    .eq('email', user.email)
                    .single()
                );
                setUser({ ...user, ...profile });
            }
        };
        getUser();
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'Posts', path: '/admin/posts' },
        { icon: MessageSquare, label: 'Comments', path: '/admin/comments' },
        { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
        { icon: Users, label: 'Subscribers', path: '/admin/subscribers' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-800">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
                    !isSidebarOpen && "-translate-x-full md:hidden"
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center text-lg font-serif">E</div>
                        Eddie Bliss
                    </Link>
                    <button
                        className="md:hidden ml-auto text-gray-500"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                        : "text-slate-500 hover:bg-gray-100 hover:text-slate-900"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100 mt-auto">
                    {user && (
                        <Link to="/admin/settings" className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors group">
                            <img
                                src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.email}
                                alt={user.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-bold text-slate-900 truncate">{user.name || user.email?.split('@')[0]}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                            <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-slate-500"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden md:flex items-center text-sm text-slate-500">
                            <span className="hover:text-slate-700 cursor-pointer">Admin</span>
                            <span className="mx-2">/</span>
                            <span className="font-medium text-slate-900">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder:text-slate-400"
                            />
                        </div>
                        <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

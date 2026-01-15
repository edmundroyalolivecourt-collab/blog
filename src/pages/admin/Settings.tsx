import { useState, useEffect } from 'react';
import { Save, User, Mail, Upload, Loader2, Lock, FileText } from 'lucide-react';
import { updateAuthor, uploadImage, updateUserCredentials } from '../../lib/api';

export default function Settings() {
    const [authors, setAuthors] = useState<any[]>([]);
    const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadAuthors();
    }, []);

    const loadAuthors = async () => {
        setLoading(true);
        // Get current user auth
        const { data: { user } } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser());

        if (user) {
            // Only fetch THIS user's profile
            const { data } = await import('../../lib/supabase').then(m => m.supabase
                .from('authors')
                .select('*')
                .eq('email', user.email)
            );

            if (data) {
                setAuthors(data);
                if (data.length > 0) {
                    selectAuthor(data[0]);
                }
            }
        }
        setLoading(false);
    };

    const selectAuthor = (author: any) => {
        setSelectedAuthor(author);
        setName(author.name);
        setBio(author.bio || '');
        setAvatar(author.avatar || '');
        setEmail(author.email);
        setPassword('');
        setConfirmPassword('');
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSaving(true);
            const url = await uploadImage(e.target.files[0]);
            if (url) {
                setAvatar(url);
            }
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!selectedAuthor) return;

        if (password && password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        setSaving(true);
        let message = 'Profile updated successfully!';

        // 1. Update Public Profile (Authors Table)
        const profileSuccess = await updateAuthor(selectedAuthor.id, {
            name,
            bio,
            avatar
        });

        // 2. Update Auth Credentials (if changed)
        // Only attempt if this is the currently logged in user ideally, 
        // but for this single-user logic we'll assume admin edits self mostly.
        // NOTE: In a real multi-user app, you can only update your OWN auth user.
        if (email !== selectedAuthor.email || password) {
            const updates: any = {};
            if (email !== selectedAuthor.email) updates.email = email;
            if (password) updates.password = password;

            const authResult = await updateUserCredentials(updates);
            if (!authResult.success) {
                message = `Profile updated, but Auth failed: ${authResult.message}`;
            } else if (updates.email) {
                message += ' Please check your new email for a confirmation link.';
            }
        }

        if (profileSuccess) {
            alert(message);
            // Update local state
            setAuthors(authors.map(a => a.id === selectedAuthor.id ? { ...a, name, bio, avatar, email } : a));
        } else {
            alert('Failed to update profile.');
        }
        setSaving(false);
        setPassword('');
        setConfirmPassword('');
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-500 mb-8">Manage author profiles and login credentials.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar - Author List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Authors</h2>
                    <div className="space-y-1">
                        {authors.map(author => (
                            <button
                                key={author.id}
                                onClick={() => selectAuthor(author)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${selectedAuthor?.id === author.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'hover:bg-gray-50 text-slate-600'
                                    }`}
                            >
                                <img
                                    src={author.avatar || 'https://i.pravatar.cc/150'}
                                    alt={author.name}
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                                <span className="font-medium text-sm truncate">{author.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">SEO & Tools</h2>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                <h3 className="font-semibold text-slate-700 text-sm">Automated Sitemap</h3>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Your <code>sitemap.xml</code> and <code>robots.txt</code> are automatically generated during the build process.
                                They will be available at the root of your domain.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content - Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    {selectedAuthor && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Profile</h3>

                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group">
                                    <img
                                        src={avatar || 'https://i.pravatar.cc/150'}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                                    />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <Upload className="w-5 h-5" />
                                        <input type="file" onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Profile Photo</p>
                                    <p className="text-sm text-slate-500">Click to upload a new avatar.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Changing email requires re-verification.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Leave empty to keep"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

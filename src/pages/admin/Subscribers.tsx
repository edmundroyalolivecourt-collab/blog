import { useState, useEffect } from 'react';
import { Mail, Calendar } from 'lucide-react';
import { getSubscribers } from '../../lib/api';

export default function Subscribers() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getSubscribers();
            setSubscribers(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="p-8">Loading subscribers...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Subscribers</h1>
            <p className="text-slate-500">Manage your newsletter audience.</p>

            <div className="grid gap-4">
                {subscribers.map((sub) => (
                    <div key={sub.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{sub.email}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Subscribed on {new Date(sub.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                            Active
                        </span>
                    </div>
                ))}
                {subscribers.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No subscribers yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

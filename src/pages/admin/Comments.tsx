import { useState, useEffect } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { getAllComments, deleteComment } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function Comments() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        setLoading(true);
        const data = await getAllComments();
        setComments(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            const success = await deleteComment(id);
            if (success) {
                setComments(comments.filter(c => c.id !== id));
            }
        }
    };

    if (loading) return <div className="p-8">Loading comments...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Comments</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Author</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Comment</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Post</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {comments.map((comment) => (
                            <tr key={comment.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-slate-900">{comment.author_name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{comment.content}</td>
                                <td className="px-6 py-4 text-sm">
                                    <Link to={`/article/${comment.article?.slug}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                        {comment.article?.title} <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(comment.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {comments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No comments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Image as ImageIcon, ArrowLeft, Loader2, Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Heading, Quote, Sparkles, Wand2, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createArticle, getArticleById, updateArticle, uploadImage } from '../../lib/api';
import { generateBlogContent, generateBlogTitle } from '../../lib/aiService';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

export default function PostEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Design');
    const [image, setImage] = useState('');
    const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiTone, setAiTone] = useState<'professional' | 'casual' | 'technical' | 'creative'>('professional');
    const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentFileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            LinkExtension.configure({
                openOnClick: false,
            }),
            ImageExtension,
            Placeholder.configure({
                placeholder: 'Tell your story...',
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (id) {
            async function loadArticle() {
                const article = await getArticleById(id!);
                if (article) {
                    setTitle(article.title);
                    setContent(article.content);
                    setImage(article.image);
                    setCategory(article.category);
                    if (article.published_at) {
                        setPublishedAt(new Date(article.published_at).toISOString().slice(0, 16));
                    }
                    if (editor && article.content) {
                        editor.commands.setContent(article.content);
                    }
                }
                setIsLoading(false);
            }
            loadArticle();
        }
    }, [id, editor]);

    const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsSubmitting(true);
            const url = await uploadImage(e.target.files[0]);
            if (url) {
                setImage(url);
            }
            setIsSubmitting(false);
        }
    };

    const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsSubmitting(true);
            const url = await uploadImage(e.target.files[0]);
            if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run();
            }
            setIsSubmitting(false);
        }
    };

    const handleToolbarAction = (action: string) => {
        if (!editor) return;

        switch (action) {
            case 'bold': editor.chain().focus().toggleBold().run(); break;
            case 'italic': editor.chain().focus().toggleItalic().run(); break;
            case 'underline': editor.chain().focus().toggleUnderline().run(); break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                } else if (url === '') {
                    editor.chain().focus().unsetLink().run();
                }
                break;
            case 'image':
                contentFileInputRef.current?.click();
                break;
            case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
            case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
            case 'quote': editor.chain().focus().toggleBlockquote().run(); break;
        }
    };

    const handleSave = async (published: boolean) => {
        setIsSubmitting(true);
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Generate excerpt from content
        const stripHtml = (html: string) => {
            const tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        };
        const plainText = stripHtml(content);
        const excerpt = plainText.substring(0, 155).trim() + (plainText.length > 155 ? '...' : '');

        const articleData = {
            title,
            content,
            excerpt,
            image: image || 'https://images.unsplash.com/photo-1493514789931-586cb2db6d77',
            category,
            read_time: `${Math.ceil(content.split(' ').length / 200)} min read`,
            published,
            published_at: new Date(publishedAt).toISOString(),
            slug: id ? undefined : slug,
            updated_at: new Date().toISOString()
        };

        try {
            if (id) {
                await updateArticle(id, articleData);
            } else {
                await createArticle({ ...articleData, slug });
            }
            navigate('/admin');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to save article.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateContent = async () => {
        if (!aiTopic.trim()) {
            alert('Please enter a topic for the blog post.');
            return;
        }

        setIsGenerating(true);
        try {
            const generatedContent = await generateBlogContent({
                topic: aiTopic,
                tone: aiTone,
                length: aiLength,
                includeIntro: true,
                includeConclusion: true
            });

            setContent(generatedContent);
            if (editor) {
                editor.commands.setContent(generatedContent);
            }

            // Optionally generate a title if one doesn't exist
            if (!title.trim()) {
                const generatedTitle = await generateBlogTitle(aiTopic);
                setTitle(generatedTitle);
            }

            setShowAIModal(false);
            setAiTopic('');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to generate content. Please check your API key.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateTitle = async () => {
        if (!aiTopic.trim() && !content.trim()) {
            alert('Please enter a topic or add some content first.');
            return;
        }

        setIsGenerating(true);
        try {
            const topic = aiTopic.trim() || title.trim() || 'blog post';
            const generatedTitle = await generateBlogTitle(topic);
            setTitle(generatedTitle);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to generate title.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading Editor...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Editor Header */}
                <header className="flex items-center justify-between py-6 mb-8 sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-slate-200/60">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="p-2.5 hover:bg-white rounded-xl text-slate-500 hover:text-slate-900 transition-all shadow-sm hover:shadow border border-transparent hover:border-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5 block">
                                {id ? 'Editing Article' : 'New Story Draft'}
                            </span>
                            <p className="text-sm font-semibold text-slate-700">
                                {isSubmitting ? 'Saving changes...' : 'Ready to publish'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 pr-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer"
                            >
                                <option>Design</option>
                                <option>Technology</option>
                                <option>AI</option>
                                <option>Crypto</option>
                                <option>Sports</option>
                                <option>Business</option>
                                <option>Affiliate Marketing</option>
                                <option>Social Media</option>
                                <option>Make Money Online</option>
                                <option>News</option>
                                <option>Culture</option>
                                <option>Travel</option>
                                <option>Lifestyle</option>
                            </select>
                        </div>
                        <div className="hidden md:flex items-center gap-2 border-r border-slate-200 pr-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule</span>
                            <input
                                type="datetime-local"
                                value={publishedAt}
                                onChange={(e) => setPublishedAt(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all disabled:opacity-50"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => setShowAIModal(true)}
                                disabled={isGenerating}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold hover:bg-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50 border border-indigo-100"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                AI Write
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-900/20"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Publish
                            </button>
                        </div>
                    </div>
                </header>

                {/* Editor Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                >
                    {/* Featured Image */}
                    <div className="group relative aspect-[21/9] bg-slate-100 flex items-center justify-center border-b border-slate-100">
                        {image ? (
                            <>
                                <img src={image} alt="Featured" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button
                                    onClick={() => setImage('')}
                                    className="absolute top-6 right-6 p-2.5 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-white transition-all shadow-lg scale-90 group-hover:scale-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center p-12 transition-transform group-hover:scale-105">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-50">
                                    <ImageIcon className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Click to upload cover story image</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFeaturedImageUpload}
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    <div className="px-8 md:px-16 py-12">
                        <div className="group relative flex items-start gap-4 mb-10">
                            <textarea
                                placeholder="Enticing Post Title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 text-4xl md:text-6xl font-serif font-extrabold bg-transparent border-none focus:ring-0 placeholder:text-slate-200 resize-none h-auto overflow-hidden leading-[1.15] outline-none text-slate-900"
                                rows={1}
                                style={{ minHeight: '80px' }}
                            />
                            <button
                                onClick={handleGenerateTitle}
                                disabled={isGenerating}
                                title="Refine Title with AI"
                                className="mt-4 p-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-2xl transition-all disabled:opacity-50 shadow-sm"
                            >
                                <Sparkles className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tiptap Toolbar */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 sticky top-28 z-20 mb-10 w-fit shadow-sm">
                            <ToolbarButton
                                icon={<Bold className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('bold')}
                                tooltip="Bold"
                                active={editor?.isActive('bold')}
                            />
                            <ToolbarButton
                                icon={<Italic className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('italic')}
                                tooltip="Italic"
                                active={editor?.isActive('italic')}
                            />
                            <ToolbarButton
                                icon={<UnderlineIcon className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('underline')}
                                tooltip="Underline"
                                active={editor?.isActive('underline')}
                            />
                            <div className="w-px h-6 bg-slate-200 mx-1" />
                            <ToolbarButton
                                icon={<Heading className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('h2')}
                                tooltip="Large Heading"
                                active={editor?.isActive('heading', { level: 2 })}
                            />
                            <ToolbarButton
                                icon={<span className="font-bold text-xs text-slate-700">H3</span>}
                                onClick={() => handleToolbarAction('h3')}
                                tooltip="Medium Heading"
                                active={editor?.isActive('heading', { level: 3 })}
                            />
                            <ToolbarButton
                                icon={<Quote className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('quote')}
                                tooltip="Quote"
                                active={editor?.isActive('blockquote')}
                            />
                            <div className="w-px h-6 bg-slate-200 mx-1" />
                            <ToolbarButton
                                icon={<LinkIcon className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('link')}
                                tooltip="Hyperlink"
                                active={editor?.isActive('link')}
                            />
                            <ToolbarButton
                                icon={<ImageIcon className="w-4 h-4" />}
                                onClick={() => handleToolbarAction('image')}
                                tooltip="Insert Inline Image"
                            />
                        </div>

                        <div className="prose prose-xl max-w-none prose-slate prose-headings:font-serif prose-p:text-slate-600 prose-p:leading-relaxed transition-all">
                            <EditorContent editor={editor} className="min-h-[600px] outline-none" />
                        </div>
                    </div>
                </motion.div>

                {/* Hidden Input for Content Images */}
                <input
                    type="file"
                    ref={contentFileInputRef}
                    onChange={handleContentImageUpload}
                    accept="image/*"
                    className="hidden"
                />

                {/* AI Generation Modal */}
                <AnimatePresence>
                    {showAIModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 md:p-10 border border-slate-100"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Blog Writer</h2>
                                            <p className="text-sm font-medium text-slate-500">Gemini Powered Intelligence</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAIModal(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">What is the story about?</label>
                                        <input
                                            type="text"
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            placeholder="e.g., The Impact of AI on Creative Arts"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Tone</label>
                                            <select
                                                value={aiTone}
                                                onChange={(e) => setAiTone(e.target.value as any)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-slate-900 appearance-none cursor-pointer"
                                            >
                                                <option value="professional">Professional</option>
                                                <option value="casual">Casual</option>
                                                <option value="technical">Technical</option>
                                                <option value="creative">Creative</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Length</label>
                                            <select
                                                value={aiLength}
                                                onChange={(e) => setAiLength(e.target.value as any)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-slate-900 appearance-none cursor-pointer"
                                            >
                                                <option value="short">Short (300-500 words)</option>
                                                <option value="medium">Medium (800-1200 words)</option>
                                                <option value="long">Long (1500-2000 words)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        onClick={() => setShowAIModal(false)}
                                        className="flex-1 px-8 py-4 border border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerateContent}
                                        disabled={isGenerating || !aiTopic.trim()}
                                        className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Wiring story...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-5 h-5" />
                                                Generate Story
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ToolbarButton({ icon, onClick, tooltip, active }: { icon: React.ReactNode, onClick: () => void, tooltip: string, active?: boolean }) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`p-2.5 rounded-xl transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
        >
            {icon}
        </button>
    );
}



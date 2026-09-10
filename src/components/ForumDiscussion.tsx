import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { ForumPost } from '../types';
import {
  MessageSquare,
  Send,
  Heart,
  Tag,
  Plus,
  Filter,
  CheckCircle,
  HelpCircle,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Pin,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';

export const ForumDiscussion: React.FC = () => {
  const {
    currentUser,
    forumPosts,
    addForumPost,
    updateForumPost,
    deleteForumPost,
    deleteForumReply,
    togglePinForumPost,
    addForumReply,
    likeForumPost,
  } = useLMS();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [activePostId, setActivePostId] = useState<string | null>(forumPosts[0]?.id || null);
  const [replyInput, setReplyInput] = useState<string>('');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);

  // Edit Post Form
  const [postToEdit, setPostToEdit] = useState<ForumPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostCategory, setEditPostCategory] = useState<ForumPost['category']>('Materi Produktif');
  const [editPostTags, setEditPostTags] = useState('');

  // Delete Post Confirmation
  const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null);

  // New Post Form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<ForumPost['category']>('Materi Produktif');
  const [postTags, setPostTags] = useState('WebDev, JavaScript');

  const categories = ['Semua', 'Materi Produktif', 'Tanya Kuis & Tugas', 'Praktik & PKL', 'Diskusi Umum'];

  const filteredPosts = forumPosts
    .filter((p) => {
      if (activeCategory === 'Semua') return true;
      return p.category === activeCategory;
    })
    .sort((a, b) => {
      // Pinned posts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const activePost = forumPosts.find((p) => p.id === activePostId) || filteredPosts[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activePost) return;

    addForumReply(activePost.id, replyInput.trim());
    setReplyInput('');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const tagsArray = postTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addForumPost(postTitle.trim(), postContent.trim(), postCategory, tagsArray);
    setShowNewPostModal(false);
    setPostTitle('');
    setPostContent('');
  };

  const handleOpenEditPost = (post: ForumPost) => {
    setPostToEdit(post);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setEditPostCategory(post.category);
    setEditPostTags(post.tags.join(', '));
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postToEdit || !editPostTitle.trim() || !editPostContent.trim()) return;

    const tagsArray = editPostTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateForumPost(postToEdit.id, {
      title: editPostTitle.trim(),
      content: editPostContent.trim(),
      category: editPostCategory,
      tags: tagsArray,
    });

    setPostToEdit(null);
  };

  const handleConfirmDeletePost = () => {
    if (!postToDelete) return;
    deleteForumPost(postToDelete.id);
    if (activePostId === postToDelete.id) {
      setActivePostId(null);
    }
    setPostToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              Ruang Kolaborasi & Diskusi Terbimbing
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Forum Diskusi Siswa & Guru SMK
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Tanyakan kendala koding, sharing praktik instalasi jaringan, konsultasi tugas, hingga
              diskusi persiapan magang / PKL industri kejuruan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewPostModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Mulai Diskusi Baru
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Topic List & Selected Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Topic List (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Topik ({filteredPosts.length})
            </span>
          </div>

          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const isSelected = activePost?.id === post.id;
              const hasLiked = post.likedBy.includes(currentUser.id);

              return (
                <div
                  key={post.id}
                  onClick={() => setActivePostId(post.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/10 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {post.category}
                      </span>
                      {post.isPinned && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                          <Pin className="w-2.5 h-2.5 fill-amber-700" /> Pin
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-slate-700 font-semibold text-[11px] truncate max-w-[120px]">
                        {post.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Heart
                          className={`w-3.5 h-3.5 ${hasLiked ? 'text-rose-500 fill-rose-500' : ''}`}
                        />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.replies.length} Balasan
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Thread View & Reply Area (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs min-h-[500px] flex flex-col justify-between">
          {activePost ? (
            <div className="space-y-6">
              {/* Post Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activePost.category}
                    </span>
                    {activePost.isPinned && (
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-amber-600" /> Disematkan Guru
                      </span>
                    )}
                  </div>

                  {/* Actions for teacher / author */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">{activePost.createdAt}</span>
                    {currentUser.role === 'guru' && (
                      <button
                        type="button"
                        onClick={() => togglePinForumPost(activePost.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          activePost.isPinned
                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                            : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-200'
                        }`}
                        title={activePost.isPinned ? 'Lepas Sematan (Unpin)' : 'Sematkan Topik (Pin ke Atas)'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${activePost.isPinned ? 'fill-amber-700' : ''}`} />
                      </button>
                    )}
                    {(currentUser.role === 'guru' || currentUser.id === activePost.authorId) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditPost(activePost)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Topik Diskusi"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostToDelete(activePost)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Topik Diskusi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {activePost.title}
                </h2>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <img
                    src={activePost.authorAvatar}
                    alt={activePost.authorName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {activePost.authorName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          activePost.authorRole === 'guru'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {activePost.authorRole === 'guru' ? 'Guru' : 'Siswa'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{activePost.className}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => likeForumPost(activePost.id)}
                    className={`ml-auto px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                      activePost.likedBy.includes(currentUser.id)
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        activePost.likedBy.includes(currentUser.id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{activePost.likes} Suka</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                  {activePost.content}
                </p>

                {activePost.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activePost.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Replies Section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Semua Tanggapan ({activePost.replies.length})
                </h4>

                {activePost.replies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada tanggapan. Jadilah yang pertama memberikan masukan!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activePost.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          reply.authorRole === 'guru'
                            ? 'bg-purple-50/60 border-purple-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={reply.authorAvatar}
                              alt={reply.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-bold text-slate-900">{reply.authorName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                reply.authorRole === 'guru'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {reply.authorRole === 'guru' ? 'Guru Pembimbing' : 'Siswa'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                            {(currentUser.role === 'guru' || currentUser.id === reply.authorId) && (
                              <button
                                type="button"
                                onClick={() => deleteForumReply(activePost.id, reply.id)}
                                className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                                title="Hapus Tanggapan Ini"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed pl-8">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={`Tuliskan tanggapan sebagai ${currentUser.name}...`}
                  className="flex-1 text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Pilih topik di sebelah kiri untuk membaca diskusi.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Discussion Post */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Mulai Topik Diskusi Baru</h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Topik</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Contoh: Pertanyaan tentang Flexbox vs CSS Grid untuk UKK"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Materi Produktif">Materi Produktif</option>
                    <option value="Tanya Kuis & Tugas">Tanya Kuis & Tugas</option>
                    <option value="Praktik & PKL">Praktik & PKL</option>
                    <option value="Diskusi Umum">Diskusi Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tags (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    placeholder="HTML, CSS, Bug"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pertanyaan / Penjelasan
                </label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Jelaskan detail pertanyaan, kode yang digunakan, atau topik yang ingin didiskusikan..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Terbitkan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Topik Diskusi */}
      {postToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-200" />
                <h3 className="font-bold text-sm">Edit & Kustomisasi Topik Diskusi</h3>
              </div>
              <button
                type="button"
                onClick={() => setPostToEdit(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Topik</label>
                <input
                  type="text"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editPostCategory}
                    onChange={(e) => setEditPostCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Materi Produktif">Materi Produktif</option>
                    <option value="Tanya Kuis & Tugas">Tanya Kuis & Tugas</option>
                    <option value="Praktik & PKL">Praktik & PKL</option>
                    <option value="Diskusi Umum">Diskusi Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tags (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={editPostTags}
                    onChange={(e) => setEditPostTags(e.target.value)}
                    placeholder="HTML, CSS, Bug"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pertanyaan / Penjelasan
                </label>
                <textarea
                  rows={4}
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPostToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition active:scale-95"
                >
                  Simpan Perubahan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Topik Diskusi */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Topik Diskusi?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus topik <span className="font-bold text-slate-800">"{postToDelete.title}"</span>? 
                Seluruh balasan dan tanggapan siswa di dalamnya akan ikut dihapus.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePost}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Ya, Hapus Topik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

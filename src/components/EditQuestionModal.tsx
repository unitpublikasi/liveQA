import React, { useState, useEffect } from "react";
import { X, MessageSquare, Sparkles, Trash2, CheckCircle2, User, Tag, FileText, AlertCircle } from "lucide-react";
import { Question, QuestionStatus } from "../types";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (questionId: string, updates: {
    content?: string;
    author?: string;
    status?: QuestionStatus;
    aiCategory?: string;
    organizerNote?: string;
    aiSuggestedAnswer?: string;
  }) => Promise<boolean>;
  onDelete: (questionId: string) => Promise<boolean>;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
  onDelete,
}) => {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<QuestionStatus>("approved");
  const [aiCategory, setAiCategory] = useState("Umum");
  const [organizerNote, setOrganizerNote] = useState("");
  const [aiSuggestedAnswer, setAiSuggestedAnswer] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen && question) {
      setContent(question.content || "");
      setAuthor(question.author || "");
      setStatus(question.status || "approved");
      setAiCategory(question.aiCategory || "Umum");
      setOrganizerNote(question.organizerNote || "");
      setAiSuggestedAnswer(question.aiSuggestedAnswer || "");
      setShowDeleteConfirm(false);
      setErrorMessage("");
    }
  }, [isOpen, question]);

  if (!isOpen || !question) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage("Isi pertanyaan tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const success = await onSave(question.id, {
        content: content.trim(),
        author: author.trim() || "Anonim",
        status,
        aiCategory: aiCategory.trim(),
        organizerNote: organizerNote.trim(),
        aiSuggestedAnswer: aiSuggestedAnswer.trim(),
      });

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menyimpan perubahan pertanyaan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(question.id);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menghapus pertanyaan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="edit-question-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        id="edit-question-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Edit & Moderasi Pertanyaan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skor AI: <strong className="text-indigo-600 dark:text-indigo-400">{question.aiScore}/100</strong> • Votes: {question.upvotes - question.downvotes}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isDeleting}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Isi Pertanyaan *
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Author & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nama Pengirim
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kategori AI
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Inovasi & Tekno">Inovasi & Tekno</option>
                  <option value="Strategi & Kebijakan">Strategi & Kebijakan</option>
                  <option value="Operasional">Operasional</option>
                  <option value="SDM & Budaya">SDM & Budaya</option>
                  <option value="Keamanan & Regulasi">Keamanan & Regulasi</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Status Moderasi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus("approved")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === "approved"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                Disetujui
              </button>
              <button
                type="button"
                onClick={() => setStatus("pinned")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === "pinned"
                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                📌 Sematkan
              </button>
              <button
                type="button"
                onClick={() => setStatus("answered")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === "answered"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                ✅ Dijawab
              </button>
              <button
                type="button"
                onClick={() => setStatus("hidden")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === "hidden"
                    ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                👁️‍🗨️ Sembunyi
              </button>
            </div>
          </div>

          {/* Organizer Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Catatan Moderator / Organizer
            </label>
            <input
              type="text"
              placeholder="Contoh: Pertanyaan prioritas utama untuk sesi tanya jawab kedua"
              value={organizerNote}
              onChange={(e) => setOrganizerNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Speaker Suggested Answer */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Panduan / Poin Jawaban Pembicara
            </label>
            <textarea
              rows={2}
              placeholder="Poin-poin jawaban panduan..."
              value={aiSuggestedAnswer}
              onChange={(e) => setAiSuggestedAnswer(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Delete section */}
          <div className="pt-2">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1.5 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Pertanyaan Ini...</span>
              </button>
            ) : (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                  Yakin ingin menghapus pertanyaan ini secara permanen?
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
                  >
                    {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting || !content.trim()}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

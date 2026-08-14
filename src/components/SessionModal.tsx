import React, { useState, useEffect } from "react";
import { Sparkles, X, Layers, User, KeyRound, AlignLeft, ToggleLeft, ToggleRight, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Session } from "../types";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: {
    id?: string;
    title: string;
    speaker: string;
    description: string;
    code: string;
    status?: "active" | "paused" | "ended";
    allowAnonymous?: boolean;
    autoApprove?: boolean;
  }) => Promise<boolean>;
  onDelete?: (sessionId: string) => Promise<boolean>;
  initialSession?: Session | null;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSession,
}) => {
  const isEditing = Boolean(initialSession?.id);

  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"active" | "paused" | "ended">("active");
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [autoApprove, setAutoApprove] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialSession) {
        setTitle(initialSession.title || "");
        setSpeaker(initialSession.speaker || "");
        setDescription(initialSession.description || "");
        setCode(initialSession.code || "");
        setStatus(initialSession.status || "active");
        setAllowAnonymous(initialSession.allowAnonymous !== false);
        setAutoApprove(initialSession.autoApprove !== false);
      } else {
        setTitle("");
        setSpeaker("");
        setDescription("");
        setCode(`LIVE-${Math.floor(1000 + Math.random() * 9000)}`);
        setStatus("active");
        setAllowAnonymous(true);
        setAutoApprove(true);
      }
      setErrorMessage("");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialSession]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Judul Acara / Sesi wajib diisi.");
      return;
    }
    if (!speaker.trim()) {
      setErrorMessage("Nama Pembicara / Panelis wajib diisi.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const success = await onSave({
        id: initialSession?.id,
        title: title.trim(),
        speaker: speaker.trim(),
        description: description.trim(),
        code: code.trim().toUpperCase(),
        status,
        allowAnonymous,
        autoApprove,
      });

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan saat menyimpan sesi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialSession?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      const success = await onDelete(initialSession.id);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menghapus sesi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="session-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        id="session-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isEditing ? "Kelola & Edit Sesi Q&A" : "Buat Sesi Q&A Live Baru"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? `Perbarui informasi untuk kode ${initialSession?.code}` : "Lengkapi data untuk memulai sesi tanya jawab live"}
              </p>
            </div>
          </div>

          <button
            id="close-session-modal-btn"
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isDeleting}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Judul Acara / Sesi *
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="session-title-input"
                type="text"
                required
                placeholder="Contoh: Keynote AI Transformation 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Speaker input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nama Pembicara / Panelis *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="session-speaker-input"
                type="text"
                required
                placeholder="Contoh: Dr. Budi Santoso & Tim Riset"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Access Code input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kode Akses Partisipan
              </label>
              <button
                type="button"
                onClick={() => setCode(`LIVE-${Math.floor(1000 + Math.random() * 9000)}`)}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Acak Kode
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="session-code-input"
                type="text"
                placeholder="Contoh: INOVASI-2026"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deskripsi Sesi
            </label>
            <div className="relative">
              <textarea
                id="session-desc-input"
                rows={2}
                placeholder="Penjelasan singkat mengenai topik pembicaraan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Status (If Editing) */}
          {isEditing && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Status Sesi
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  🟢 Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("paused")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    status === "paused"
                      ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  ⏸️ Jeda
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("ended")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    status === "ended"
                      ? "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  ⏹️ Ditutup
                </button>
              </div>
            </div>
          )}

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Izinkan Anonim
                </span>
                <span className="text-[10px] text-slate-400">
                  Partisipan bisa sembunyikan nama
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowAnonymous(!allowAnonymous)}
                className="text-indigo-600 dark:text-indigo-400 p-1"
              >
                {allowAnonymous ? (
                  <ToggleRight className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Auto-Approve AI
                </span>
                <span className="text-[10px] text-slate-400">
                  Langsung tampil tanpa moderasi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoApprove(!autoApprove)}
                className="text-indigo-600 dark:text-indigo-400 p-1"
              >
                {autoApprove ? (
                  <ToggleRight className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Delete Confirmation Section (If Editing) */}
          {isEditing && onDelete && (
            <div className="pt-2">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1.5 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Sesi Ini...</span>
                </button>
              ) : (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                    Yakin ingin menghapus sesi "{initialSession?.title}"? Seluruh pertanyaan di dalamnya akan terhapus.
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
                    >
                      {isDeleting ? "Menghapus..." : "Ya, Hapus Sesi"}
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
          )}

          {/* Modal Footer Actions */}
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
              id="submit-session-btn"
              type="submit"
              disabled={isSubmitting || isDeleting || !title.trim() || !speaker.trim()}
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
                  <span>{isEditing ? "Simpan Perubahan" : "Buat Sesi Sekarang"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

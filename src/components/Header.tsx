import React, { useState } from "react";
import {
  MessageSquareText,
  BarChart3,
  Tv2,
  QrCode,
  Sparkles,
  ChevronDown,
  Plus,
  Radio,
  CheckCircle2,
  X
} from "lucide-react";
import { Session } from "../types";

interface HeaderProps {
  currentView: "participant" | "organizer" | "presenter";
  onViewChange: (view: "participant" | "organizer" | "presenter") => void;
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: (title: string, speaker: string, description: string, code: string) => void;
  onOpenQrModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  sessions,
  activeSession,
  onSelectSession,
  onCreateSession,
  onOpenQrModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // New session form state
  const [newTitle, setNewTitle] = useState("");
  const [newSpeaker, setNewSpeaker] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCode, setNewCode] = useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newSpeaker.trim()) {
      onCreateSession(newTitle, newSpeaker, newDesc, newCode);
      setIsNewModalOpen(false);
      setNewTitle("");
      setNewSpeaker("");
      setNewDesc("");
      setNewCode("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Active Session Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>LiveQ</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                    AI Auto-Sort
                  </span>
                </span>
              </div>
            </div>

            {/* Session Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span className="font-semibold max-w-[140px] sm:max-w-[200px] truncate">
                  {activeSession ? activeSession.code : "Pilih Sesi"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    Daftar Sesi Q&A
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {sessions.map((sess) => (
                      <button
                        key={sess.id}
                        onClick={() => {
                          onSelectSession(sess.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                          activeSession?.id === sess.id ? "bg-indigo-50/70 text-indigo-600 font-semibold dark:bg-indigo-950/40 dark:text-indigo-400" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {sess.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {sess.code} • {sess.speaker}
                          </div>
                        </div>
                        {activeSession?.id === sess.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsNewModalOpen(true);
                      }}
                      className="w-full py-2 px-3 text-xs font-medium text-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Sesi Q&A Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onViewChange("participant")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                currentView === "participant"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Partisipan</span>
            </button>

            <button
              onClick={() => onViewChange("organizer")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                currentView === "organizer"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dasbor Analitik</span>
            </button>

            <button
              onClick={() => onViewChange("presenter")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                currentView === "presenter"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Tv2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Layar Panggung</span>
            </button>
          </div>

          {/* QR Code Trigger Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenQrModal}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Tampilkan Barcode / QR Code Sesi"
            >
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Scan QR</span>
            </button>
          </div>

        </div>
      </div>

      {/* Modal Buat Sesi Baru */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Buat Sesi Q&A Live Baru</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Acara / Sesi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keynote AI Strategy 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pembicara / Panelis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Budi Santoso"
                  value={newSpeaker}
                  onChange={(e) => setNewSpeaker(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Akses Sesi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: INOVASI-2026 (kosongkan untuk acak)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan singkat mengenai topik pembicaraan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Mulai Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

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
  Settings,
  Flame,
} from "lucide-react";
import { Session } from "../types";

interface HeaderProps {
  currentView: "participant" | "organizer" | "presenter";
  onViewChange: (view: "participant" | "organizer" | "presenter") => void;
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (sessionId: string) => void;
  onOpenCreateSession: () => void;
  onOpenEditSession?: () => void;
  onOpenQrModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  sessions,
  activeSession,
  onSelectSession,
  onOpenCreateSession,
  onOpenEditSession,
  onOpenQrModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
          
          {/* Brand Logo & Active Session Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
                <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="hidden xs:block">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>LiveQ</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                    AI
                  </span>
                </span>
              </div>
            </div>

            {/* Session Selector Dropdown */}
            <div className="relative">
              <button
                id="session-dropdown-btn"
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/80 dark:border-slate-700 max-w-[140px] sm:max-w-[220px]"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">
                  {activeSession ? activeSession.code : "Pilih Sesi"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 py-2 z-50 animate-fade-in">
                    <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Daftar Sesi Q&A ({sessions.length})
                      </span>
                      {activeSession && onOpenEditSession && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenEditSession();
                          }}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <Settings className="w-3 h-3" />
                          <span>Edit Sesi Aktif</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                      {sessions.map((sess) => (
                        <button
                          key={sess.id}
                          type="button"
                          onClick={() => {
                            onSelectSession(sess.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            activeSession?.id === sess.id
                              ? "bg-indigo-50/80 text-indigo-600 font-bold dark:bg-indigo-950/50 dark:text-indigo-300"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="pr-2">
                            <div className="font-bold line-clamp-1">
                              {sess.title}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{sess.code}</span>
                              <span>•</span>
                              <span className="truncate">{sess.speaker}</span>
                            </div>
                          </div>
                          {activeSession?.id === sess.id && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        id="dropdown-create-session-btn"
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenCreateSession();
                        }}
                        className="w-full py-2.5 px-3 text-xs font-bold text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Buat Sesi Baru (Pop-up)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* View Mode Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold uppercase shrink-0">
            <button
              id="view-participant-tab"
              type="button"
              onClick={() => onViewChange("participant")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                currentView === "participant"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-black"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Partisipan</span>
            </button>

            <button
              id="view-organizer-tab"
              type="button"
              onClick={() => onViewChange("organizer")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                currentView === "organizer"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-black"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dasbor</span>
            </button>

            <button
              id="view-presenter-tab"
              type="button"
              onClick={() => onViewChange("presenter")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                currentView === "presenter"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-black"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Tv2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Panggung</span>
            </button>
          </div>

          {/* Quick Actions: Direct "+ Buat Sesi" Button & "Scan QR" */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              id="header-create-session-btn"
              type="button"
              onClick={onOpenCreateSession}
              className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-200 dark:shadow-none"
              title="Buat Sesi Q&A Baru"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Sesi Baru</span>
            </button>

            <button
              id="header-open-qr-btn"
              type="button"
              onClick={onOpenQrModal}
              className="px-2.5 sm:px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700"
              title="Tampilkan Barcode / QR Code Sesi"
            >
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Scan QR</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

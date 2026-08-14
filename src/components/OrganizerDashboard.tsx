import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  Bot,
  Download,
  Pin,
  EyeOff,
  Filter,
  PieChart,
  RefreshCw,
  Edit3,
  Check,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Plus,
  Settings,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { Session, SessionAnalytics, Question } from "../types";

interface OrganizerDashboardProps {
  session: Session;
  onUpdateQuestionStatus: (questionId: string, status: Question["status"], note?: string) => void;
  onGenerateAiSummary: () => Promise<void>;
  onOpenCreateSession: () => void;
  onOpenEditSession: () => void;
  onOpenEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<boolean>;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  session,
  onUpdateQuestionStatus,
  onGenerateAiSummary,
  onOpenCreateSession,
  onOpenEditSession,
  onOpenEditQuestion,
  onDeleteQuestion,
}) => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>("all");

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [session.id, session.questions]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      await onGenerateAiSummary();
      await fetchAnalytics();
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Export CSV Report
  const handleExportCsv = () => {
    const headers = ["ID", "Penulis", "Pertanyaan", "Upvotes", "Downvotes", "Skor AI", "Bobot AI", "Kategori", "Status", "Waktu"];
    const rows = session.questions.map((q) => [
      q.id,
      `"${(q.author || "Anonim").replace(/"/g, '""')}"`,
      `"${(q.content || "").replace(/"/g, '""')}"`,
      q.upvotes,
      q.downvotes,
      q.aiScore,
      q.aiWeight,
      `"${q.aiCategory || "Umum"}"`,
      q.status,
      new Date(q.timestamp).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LiveQ_Report_${session.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQuestions = session.questions.filter((q) => {
    if (selectedFilterStatus === "all") return q.status !== "hidden";
    return q.status === selectedFilterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Dashboard Top Header & Session Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              Dasbor Penyelenggara & Moderator
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-lg">
              Kode: {session.code}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              session.status === "active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : session.status === "paused"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}>
              {session.status === "active" ? "🟢 Live" : session.status === "paused" ? "⏸️ Jeda" : "⏹️ Ditutup"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {session.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pembicara: <strong className="text-slate-700 dark:text-slate-200">{session.speaker}</strong>
          </p>
        </div>

        {/* Quick action buttons for Session CRUD */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="organizer-edit-session-btn"
            type="button"
            onClick={onOpenEditSession}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Kelola Sesi</span>
          </button>

          <button
            id="organizer-create-session-btn"
            type="button"
            onClick={onOpenCreateSession}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Sesi Baru</span>
          </button>

          <button
            id="organizer-export-csv-btn"
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Real-time Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Pertanyaan
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {analytics?.totalQuestions ?? session.questions.length}
            </span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Partisipan Aktif
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {analytics?.activeParticipants ?? session.activeParticipants}
            </span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Rata-Rata Skor AI
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
              {analytics?.avgAiScore ?? 0}<span className="text-xs text-slate-400 font-normal">/100</span>
            </span>
          </div>
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Telah Dijawab
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {analytics?.answeredCount ?? session.questions.filter(q => q.status === "answered").length}
            </span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* AI Executive Summary Panel */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-800/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                AI Executive Summary & Rekomendasi Jawaban
              </h2>
              <p className="text-xs text-indigo-300">
                Sintesis otomatis dari seluruh aspirasi dan pertanyaan audiens
              </p>
            </div>
          </div>

          <button
            id="generate-ai-summary-btn"
            type="button"
            disabled={isGeneratingSummary}
            onClick={handleGenerateSummary}
            className="px-4 py-2 text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm shrink-0 disabled:opacity-50"
          >
            {isGeneratingSummary ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Menganalisis dengan Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Perbarui Ringkasan AI</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-xs sm:text-sm text-indigo-50 leading-relaxed font-medium">
          {session.aiExecutiveSummary ? (
            <p className="whitespace-pre-line">{session.aiExecutiveSummary}</p>
          ) : (
            <p className="text-indigo-200/70 italic">
              Klik "Perbarui Ringkasan AI" di atas untuk menghasilkan ringkasan eksekutif dan rekomendasi tanggapan pembicara secara otomatis.
            </p>
          )}
        </div>
      </div>

      {/* Category Breakdown & Quality Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Distribusi Kategori Pertanyaan (AI Cluster)</span>
            </h3>
          </div>

          <div className="space-y-3.5">
            {analytics?.categoryDistribution?.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {cat.count} pertanyaan ({cat.percentage}%) • Avg Skor: {cat.avgScore}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(cat.percentage, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment & Engagement Profile */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Profil Kualitas & Kedalaman Pembahasan</span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900">
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Konstruktif</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {analytics?.sentimentBreakdown?.constructive ?? 0}
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Netral</div>
              <div className="text-xl font-black text-slate-600 dark:text-slate-400 mt-1">
                {analytics?.sentimentBreakdown?.neutral ?? 0}
              </div>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 dark:bg-amber-950/40 dark:border-amber-900">
              <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Kritis & Dalam</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {analytics?.sentimentBreakdown?.critical ?? 0}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-200 space-y-1">
            <span className="font-bold block">💡 Panduan Moderator:</span>
            <span>Anda dapat menyematkan (pin) pertanyaan terbaik agar langsung tampil di layar panggung presentasi secara otomatis.</span>
          </div>
        </div>

      </div>

      {/* Questions Moderation & CRUD Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Manajemen Pertanyaan ({filteredQuestions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Edit konten, moderasi status, sematkan ke panggung, atau hapus pertanyaan spam
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilterStatus}
              onChange={(e) => setSelectedFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="all">Semua Pertanyaan</option>
              <option value="pinned">📌 Disematkan (Pinned)</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="answered">✅ Sudah Dijawab</option>
              <option value="hidden">👁️‍🗨️ Sembunyi</option>
            </select>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Belum ada pertanyaan pada filter ini.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        Skor AI: {q.aiScore}/100
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {q.aiCategory}
                      </span>
                      <span className="text-slate-400">
                        • Pengirim: <strong className="text-slate-600 dark:text-slate-300">{q.author}</strong>
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        • Upvotes: +{q.upvotes}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {q.content}
                    </p>

                    {q.organizerNote && (
                      <p className="text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 font-medium">
                        <strong>Catatan Moderator:</strong> {q.organizerNote}
                      </p>
                    )}

                    {q.aiSuggestedAnswer && (
                      <p className="text-xs text-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 dark:text-indigo-300 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 font-medium">
                        <strong>Panduan Jawaban AI:</strong> {q.aiSuggestedAnswer}
                      </p>
                    )}
                  </div>

                  {/* Action buttons: Edit, Pin, Answer, Hide, Delete */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenEditQuestion(q)}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                      title="Edit Pertanyaan & Catatan"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuestionStatus(
                          q.id,
                          q.status === "pinned" ? "approved" : "pinned"
                        )
                      }
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        q.status === "pinned"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                      title={q.status === "pinned" ? "Lepas Sematan" : "Sematkan di Panggung"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuestionStatus(
                          q.id,
                          q.status === "answered" ? "approved" : "answered"
                        )
                      }
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        q.status === "answered"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                      title={q.status === "answered" ? "Tandai Belum Dijawab" : "Tandai Sudah Dijawab"}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl transition-colors"
                      title="Hapus Pertanyaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

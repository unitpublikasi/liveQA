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
  Zap
} from "lucide-react";
import { Session, SessionAnalytics, Question } from "../types";

interface OrganizerDashboardProps {
  session: Session;
  onUpdateQuestionStatus: (questionId: string, status: Question["status"], note?: string) => void;
  onGenerateAiSummary: () => Promise<void>;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  session,
  onUpdateQuestionStatus,
  onGenerateAiSummary,
}) => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>("all");
  const [editingNoteQuestionId, setEditingNoteQuestionId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");

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
    const headers = ["ID", "Penulis", "Pertanyaan", "Upvotes", "Skor AI", "Kategori", "Status", "Waktu"];
    const rows = session.questions.map((q) => [
      q.id,
      `"${q.author.replace(/"/g, '""')}"`,
      `"${q.content.replace(/"/g, '""')}"`,
      q.upvotes,
      q.aiScore,
      `"${q.aiCategory}"`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              Dasbor Penyelenggara & Moderator
            </span>
            <span className="text-xs font-mono text-slate-400">
              Sesi: {session.code}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Analitik Aktivitas Partisipan Real-Time
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAnalytics}
            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Perbarui Data Analitik"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAnalytics ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Laporan CSV</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingSummary ? "animate-spin" : ""}`} />
            <span>{isGeneratingSummary ? "Menyintesis AI..." : "Ringkasan AI Sesi"}</span>
          </button>
        </div>
      </div>

      {/* KPI Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Pertanyaan</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics?.totalQuestions ?? session.questions.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">100% Terdaftar</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Rata-rata Skor AI</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {analytics?.avgAiScore ?? 0}<span className="text-sm text-slate-400 font-normal">/100</span>
          </div>
          <span className="text-[10px] text-indigo-500 font-medium">Evaluasi Kualitas AI</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Upvotes</span>
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics?.totalVotes ?? 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Interaksi Peserta</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Terjawab</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics?.answeredCount ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {analytics?.totalQuestions ? Math.round(((analytics.answeredCount ?? 0) / analytics.totalQuestions) * 100) : 0}% Tingkat Selesai
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Partisipan Live</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{session.activeParticipants}</span>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Aktif Saat Ini</span>
        </div>

      </div>

      {/* AI Executive Summary Card */}
      {session.aiExecutiveSummary && (
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-lg border border-indigo-800/50 relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Sintesis Analisis AI Eksekutif (Gemini 3.6 Flash)
              </h3>
              <p className="text-[11px] text-indigo-200">
                Rangkuman otomatis minat audiens dan rekomendasi penanganan sesi
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100/90 whitespace-pre-line leading-relaxed pl-1">
            {session.aiExecutiveSummary}
          </p>
        </div>
      )}

      {/* Category Breakdown & Activity Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Distribution */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Distribusi Topik Kategori Pertanyaan</span>
            </h3>
          </div>

          <div className="space-y-3">
            {analytics?.categoryDistribution.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{cat.name}</span>
                  <span className="text-slate-400 font-mono">
                    {cat.count} pertanyaan ({cat.percentage}%) • Rata-rata Skor AI: {cat.avgScore}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment & Engagement Quality */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Profil Kualitas & Tone Pertanyaan</span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Konstruktif</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {analytics?.sentimentBreakdown.constructive ?? 0}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Netral</div>
              <div className="text-lg font-bold text-slate-600 dark:text-slate-400 mt-1">
                {analytics?.sentimentBreakdown.neutral ?? 0}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 dark:bg-amber-950/40 dark:border-amber-900">
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Kritis & Dalam</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                {analytics?.sentimentBreakdown.critical ?? 0}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-200 space-y-1">
            <span className="font-bold block">💡 Petunjuk Moderasi Penyelenggara:</span>
            <span>Gunakan tombol "Sematkan di Panggung" pada daftar di bawah untuk mengarahkan layar tayang ke pertanyaan dengan bobot AI paling strategis.</span>
          </div>
        </div>

      </div>

      {/* Questions Moderation Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Manajemen & Moderasi Pertanyaan ({filteredQuestions.length})
          </h3>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilterStatus}
              onChange={(e) => setSelectedFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="all">Semua Pertanyaan</option>
              <option value="pinned">Disematkan (Pinned)</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="answered">Sudah Dijawab</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Skor AI: {q.aiScore}/100
                    </span>
                    <span>•</span>
                    <span className="text-slate-500 font-medium">{q.aiCategory}</span>
                    <span>•</span>
                    <span className="text-slate-400">{q.author}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {q.content}
                  </p>
                  {q.organizerNote && (
                    <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <strong>Catatan Moderator:</strong> {q.organizerNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={() =>
                      onUpdateQuestionStatus(
                        q.id,
                        q.status === "pinned" ? "approved" : "pinned"
                      )
                    }
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      q.status === "pinned"
                        ? "bg-amber-500 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                    title="Sematkan di Panggung"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() =>
                      onUpdateQuestionStatus(
                        q.id,
                        q.status === "answered" ? "approved" : "answered"
                      )
                    }
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      q.status === "answered"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                    title="Tandai Sudah Dijawab"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUpdateQuestionStatus(q.id, "hidden")}
                    className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg transition-colors"
                    title="Sembunyikan Pertanyaan"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

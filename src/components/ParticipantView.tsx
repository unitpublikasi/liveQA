import React, { useState, useMemo } from "react";
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Pin,
  Bot,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Zap,
  Tag
} from "lucide-react";
import { Question, Session, SortOption } from "../types";

interface ParticipantViewProps {
  session: Session;
  userId: string;
  onPostQuestion: (author: string, content: string) => Promise<void>;
  onVoteQuestion: (questionId: string, type: "up" | "down") => void;
  onOpenQrModal: () => void;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  session,
  userId,
  onPostQuestion,
  onVoteQuestion,
  onOpenQrModal,
}) => {
  const [authorName, setAuthorName] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [questionContent, setQuestionContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<SortOption>("smart_ai");
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);

  const categories = [
    "Semua",
    "Inovasi & Tekno",
    "Strategi & Kebijakan",
    "SDM & Budaya",
    "Keamanan & Regulasi",
    "Operasional",
    "Umum",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const author = isAnonymous ? "Anonim" : authorName.trim() || "Anonim";
      await onPostQuestion(author, questionContent);
      setQuestionContent("");
    } catch (err) {
      console.error("Failed to post question", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Auto Sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let result = session.questions.filter((q) => q.status !== "hidden" && q.status !== "archived");

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.content.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.aiCategory.toLowerCase().includes(q) ||
          item.aiTags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (selectedCategory !== "Semua") {
      result = result.filter((item) => item.aiCategory === selectedCategory);
    }

    // Auto Sort Logic
    return result.sort((a, b) => {
      // Pinned always top
      if (a.status === "pinned" && b.status !== "pinned") return -1;
      if (b.status === "pinned" && a.status !== "pinned") return 1;

      switch (sortBy) {
        case "smart_ai":
          // Auto Sort Best Questions using AI Weight + Vote combination
          return b.aiWeight - a.aiWeight;
        case "most_voted":
          return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
        case "highest_ai_score":
          return b.aiScore - a.aiScore;
        case "newest":
          return b.timestamp - a.timestamp;
        case "answered":
          if (a.status === "answered" && b.status !== "answered") return -1;
          if (b.status === "answered" && a.status !== "answered") return 1;
          return b.aiWeight - a.aiWeight;
        default:
          return b.aiWeight - a.aiWeight;
      }
    });
  }, [session.questions, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      
      {/* Session Title Banner */}
      <div className="p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span>Sesi Live Q&A</span>
              </span>
              <span className="text-xs font-mono text-indigo-200">
                Kode: {session.code}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              {session.title}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 flex items-center space-x-2">
              <User className="w-3.5 h-3.5" />
              <span>Pembicara: {session.speaker}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={onOpenQrModal}
              className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center space-x-1.5 transition-colors shadow-lg shadow-indigo-900/40"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Scan / QR Sesi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Question Submission Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-950 dark:text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Tanyakan Sesuatu (AI Evaluasi Otomatis)
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            required
            rows={3}
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            placeholder="Tulis pertanyaan Anda dengan jelas di sini..."
            className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span>Kirim sebagai Anonim</span>
              </label>

              {!isAnonymous && (
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !questionContent.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Mengevaluasi Kualitas AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pertanyaan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filters & Auto-Sort Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci pertanyaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Auto Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="smart_ai">⚡ AI Smart Weight (Skor AI + Vote)</option>
              <option value="most_voted">👍 Vote Terbanyak</option>
              <option value="highest_ai_score">🧠 Skor Kualitas AI</option>
              <option value="newest">🕒 Pertanyaan Terbaru</option>
              <option value="answered">✅ Sudah Dijawab</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Menampilkan {filteredAndSortedQuestions.length} Pertanyaan
          </span>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Sort Aktif</span>
          </span>
        </div>

        {filteredAndSortedQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
            <Bot className="w-10 h-10 mx-auto mb-2 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum ada pertanyaan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Jadilah orang pertama yang mengajukan pertanyaan pada sesi ini!
            </p>
          </div>
        ) : (
          filteredAndSortedQuestions.map((question, idx) => {
            const hasVoted = question.votedUserIds.includes(userId);
            const isReasonExpanded = expandedReasonId === question.id;

            return (
              <div
                key={question.id}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  question.status === "pinned"
                    ? "bg-amber-50/50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800"
                    : question.status === "answered"
                    ? "bg-emerald-50/30 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900"
                    : "bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Question Main Content */}
                  <div className="flex-1 space-y-2">
                    
                    {/* Status & Category Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      
                      {/* Pinned Indicator */}
                      {question.status === "pinned" && (
                        <span className="px-2 py-0.5 font-semibold text-amber-800 bg-amber-100 rounded-md dark:bg-amber-900/60 dark:text-amber-200 flex items-center space-x-1">
                          <Pin className="w-3 h-3" />
                          <span>Disematkan di Panggung</span>
                        </span>
                      )}

                      {/* Answered Indicator */}
                      {question.status === "answered" && (
                        <span className="px-2 py-0.5 font-semibold text-emerald-800 bg-emerald-100 rounded-md dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai Dijawab</span>
                        </span>
                      )}

                      {/* AI Quality Badge */}
                      <span className="px-2 py-0.5 font-bold text-indigo-700 bg-indigo-50 rounded-md dark:bg-indigo-950 dark:text-indigo-300 flex items-center space-x-1 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Bobot AI: {question.aiScore}/100</span>
                      </span>

                      {/* Category Pill */}
                      <span className="px-2 py-0.5 font-medium text-slate-600 bg-slate-100 rounded-md dark:bg-slate-800 dark:text-slate-300">
                        {question.aiCategory}
                      </span>

                      {/* Rank Index */}
                      <span className="text-slate-400 text-[10px] ml-auto">
                        Rank #{idx + 1}
                      </span>
                    </div>

                    {/* Content Text */}
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      {question.content}
                    </p>

                    {/* Metadata & Author */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {question.author}
                      </span>
                      <span>•</span>
                      <span>{new Date(question.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* AI Reasoning Accordion Toggle */}
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setExpandedReasonId(isReasonExpanded ? null : question.id)
                        }
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center space-x-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>{isReasonExpanded ? "Sembunyikan Analisis AI" : "Lihat Analisis AI"}</span>
                        {isReasonExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {isReasonExpanded && (
                        <div className="mt-2 p-3 bg-indigo-50/50 rounded-xl text-xs text-slate-700 dark:bg-indigo-950/30 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900 space-y-1.5 animate-fade-in">
                          <p>
                            <strong className="text-indigo-900 dark:text-indigo-300">Alasan Bobot AI:</strong>{" "}
                            {question.aiReasoning}
                          </p>
                          {question.aiSuggestedAnswer && (
                            <p className="pt-1 border-t border-indigo-100 dark:border-indigo-900 text-slate-600 dark:text-slate-400">
                              <strong className="text-indigo-900 dark:text-indigo-300">Saran Pembicara:</strong>{" "}
                              {question.aiSuggestedAnswer}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {question.aiTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded text-indigo-700 dark:text-indigo-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upvote & Downvote Control Box */}
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200/60 dark:bg-slate-800/80 dark:border-slate-700 flex-shrink-0">
                    <button
                      onClick={() => onVoteQuestion(question.id, "up")}
                      className={`p-2 rounded-xl transition-all ${
                        hasVoted
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                      title="Setuju / Upvote"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span className="my-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                      {question.upvotes - question.downvotes}
                    </span>
                    <button
                      onClick={() => onVoteQuestion(question.id, "down")}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Downvote"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

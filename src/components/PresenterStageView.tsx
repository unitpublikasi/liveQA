import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Sparkles,
  ThumbsUp,
  CheckCircle2,
  Tv,
  Pin,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Zap,
  Maximize2,
  Radio
} from "lucide-react";
import { Question, Session } from "../types";

interface PresenterStageViewProps {
  session: Session;
  onUpdateQuestionStatus: (questionId: string, status: Question["status"]) => void;
}

export const PresenterStageView: React.FC<PresenterStageViewProps> = ({
  session,
  onUpdateQuestionStatus,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Top AI-ranked approved/pinned questions
  const topQuestions = [...session.questions]
    .filter((q) => q.status !== "hidden" && q.status !== "archived")
    .sort((a, b) => {
      if (a.status === "pinned" && b.status !== "pinned") return -1;
      if (b.status === "pinned" && a.status !== "pinned") return 1;
      return b.aiWeight - a.aiWeight;
    });

  const currentQuestion = topQuestions[activeQuestionIndex] || topQuestions[0];

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?code=${encodeURIComponent(session.code)}`
    : `https://liveq.app/?code=${session.code}`;

  useEffect(() => {
    if (session.code) {
      QRCode.toDataURL(joinUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Stage QR error", err));
    }
  }, [session.code, joinUrl]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white p-6 md:p-10 flex flex-col justify-between space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner Header for Broadcast Screen */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-full flex items-center space-x-1.5 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE LAYAR PANGGUNG</span>
            </span>
            <span className="text-sm font-mono text-indigo-400">
              Kode Sesi: {session.code}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {session.title}
          </h1>
          <p className="text-sm text-slate-400">
            Pembicara: {session.speaker}
          </p>
        </div>

        {/* Live Audience QR Code Badge */}
        <div className="flex items-center space-x-4 p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR Join Code"
              className="w-20 h-20 rounded-lg bg-white p-1 object-contain"
            />
          )}
          <div>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-400 mb-0.5">
              <QrCode className="w-3.5 h-3.5" />
              <span>SCAN UNTUK TANYA</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Sesi: <span className="font-bold text-white">{session.code}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Partisipan: {session.activeParticipants} Orang
            </p>
          </div>
        </div>
      </div>

      {/* Main Active Question Spotlight Card */}
      {currentQuestion ? (
        <div className="flex-1 my-auto max-w-5xl mx-auto w-full flex flex-col justify-center space-y-6 py-6">
          
          <div className="p-8 md:p-12 bg-slate-900/90 rounded-3xl border-2 border-indigo-500/50 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg flex items-center space-x-1.5 shadow-md shadow-indigo-600/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bobot Kualitas AI: {currentQuestion.aiScore}/100</span>
                </span>
                <span className="px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                  {currentQuestion.aiCategory}
                </span>
                {currentQuestion.status === "pinned" && (
                  <span className="px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg flex items-center space-x-1">
                    <Pin className="w-3.5 h-3.5" />
                    <span>Disematkan Pembicara</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-700">
                <ThumbsUp className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">
                  {currentQuestion.upvotes - currentQuestion.downvotes} Vote
                </span>
              </div>
            </div>

            {/* Display Question Content */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-6">
              "{currentQuestion.content}"
            </h2>

            {/* Author */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-sm text-slate-400">
              <div>
                Ditanyakan oleh: <span className="text-indigo-300 font-bold">{currentQuestion.author}</span>
              </div>
              <div>
                Rekomendasi Peringkat AI #{activeQuestionIndex + 1}
              </div>
            </div>

            {/* Speaker Suggested Answer Guide */}
            {currentQuestion.aiSuggestedAnswer && (
              <div className="mt-6 p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panduan Jawaban Pencerahan untuk Pembicara (AI Auto-Outline):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {currentQuestion.aiSuggestedAnswer}
                </p>
              </div>
            )}

          </div>

          {/* Stage Controls */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Pertanyaan Sebelumnya</span>
              </button>

              <button
                disabled={activeQuestionIndex >= topQuestions.length - 1}
                onClick={() => setActiveQuestionIndex((prev) => Math.min(topQuestions.length - 1, prev + 1))}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <span>Pertanyaan Terbaik Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onUpdateQuestionStatus(
                    currentQuestion.id,
                    currentQuestion.status === "answered" ? "approved" : "answered"
                  )
                }
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
                  currentQuestion.status === "answered"
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentQuestion.status === "answered" ? "Tandai Belum Dijawab" : "Selesai Dijawab"}</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 my-auto text-center py-20">
          <Tv className="w-16 h-16 mx-auto mb-4 text-slate-600 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-300">
            Menunggu Pertanyaan Pertama...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Minta audiens memindai QR Code di layar untuk mengirim pertanyaan.
          </p>
        </div>
      )}

      {/* Bottom Queue Bar */}
      <div className="pt-4 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>Antrean Pertanyaan Terbaik AI ({topQuestions.length})</span>
          <span>Gunakan panah navigasi atau klik item untuk menampilkan di panggung</span>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {topQuestions.slice(0, 8).map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestionIndex(idx)}
              className={`p-3 rounded-xl border text-left min-w-[220px] max-w-[280px] transition-all flex-shrink-0 ${
                idx === activeQuestionIndex
                  ? "bg-indigo-950 border-indigo-500 text-white shadow-lg"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className="text-indigo-400">#Rank {idx + 1}</span>
                <span>Skor AI: {q.aiScore}</span>
              </div>
              <p className="text-xs font-medium line-clamp-2 text-slate-200">
                {q.content}
              </p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

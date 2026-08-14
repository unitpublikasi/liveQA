import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ParticipantView } from "./components/ParticipantView";
import { PresenterStageView } from "./components/PresenterStageView";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { QrScannerModal } from "./components/QrScannerModal";
import { SessionModal } from "./components/SessionModal";
import { EditQuestionModal } from "./components/EditQuestionModal";
import { Session, Question, QuestionStatus } from "./types";
import { Sparkles, Plus, Radio, AlertCircle } from "lucide-react";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<"participant" | "organizer" | "presenter">("participant");
  
  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [sessionModalTarget, setSessionModalTarget] = useState<Session | null>(null);
  
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState<boolean>(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Generate or retrieve persistent local user ID for vote tracking
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("liveq_user_id");
      if (stored) return stored;
      const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("liveq_user_id", newId);
      return newId;
    }
    return "user-anon";
  });

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  // Fetch list of sessions
  const fetchSessions = useCallback(async (selectFirstIfEmpty = true) => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data: Session[] = await res.json();
        setSessions(data);

        // If no active session selected yet, check URL code or select first
        if (data.length > 0) {
          if (!activeSessionId) {
            const urlParams = new URLSearchParams(window.location.search);
            const codeParam = urlParams.get("code");
            if (codeParam) {
              const found = data.find((s) => s.code.toUpperCase() === codeParam.toUpperCase());
              if (found) {
                setActiveSessionId(found.id);
                return;
              }
            }
            if (selectFirstIfEmpty) {
              setActiveSessionId(data[0].id);
            }
          }
        } else {
          setActiveSession(null);
          setActiveSessionId("");
        }
      }
    } catch (err) {
      console.error("Failed to load sessions list", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  // Fetch full details for active session
  const fetchActiveSessionDetails = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data: Session = await res.json();
        setActiveSession(data);
      }
    } catch (err) {
      console.error("Failed to fetch session details", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Load session details on session change
  useEffect(() => {
    if (activeSessionId) {
      fetchActiveSessionDetails(activeSessionId);
    }
  }, [activeSessionId, fetchActiveSessionDetails]);

  // Periodic background refresh for live votes & sync
  useEffect(() => {
    if (!activeSessionId) return;
    const interval = setInterval(() => {
      fetchActiveSessionDetails(activeSessionId);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSessionId, fetchActiveSessionDetails]);

  // -------------------------------------------------------------
  // SESSION CRUD HANDLERS
  // -------------------------------------------------------------

  // Save Session (Handles both Create New and Update Existing)
  const handleSaveSession = async (data: {
    id?: string;
    title: string;
    speaker: string;
    description: string;
    code: string;
    status?: "active" | "paused" | "ended";
    allowAnonymous?: boolean;
    autoApprove?: boolean;
  }): Promise<boolean> => {
    try {
      if (data.id) {
        // UPDATE Existing Session
        const res = await fetch(`/api/sessions/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memperbarui sesi.");
        }

        const updated: Session = await res.json();
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
        setActiveSession((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
        showToast(`Sesi "${updated.title}" berhasil diperbarui.`);
        return true;
      } else {
        // CREATE New Session
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal membuat sesi baru.");
        }

        const newSess: Session = await res.json();
        setSessions((prev) => [newSess, ...prev]);
        setActiveSessionId(newSess.id);
        setActiveSession(newSess);
        showToast(`Sesi baru "${newSess.title}" (Kode: ${newSess.code}) berhasil dibuat!`);
        return true;
      }
    } catch (err: any) {
      console.error("Session save error", err);
      throw err;
    }
  };

  // Delete Session
  const handleDeleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghapus sesi.");
      }

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          if (filtered.length > 0) {
            setActiveSessionId(filtered[0].id);
            setActiveSession(filtered[0]);
          } else {
            setActiveSessionId("");
            setActiveSession(null);
          }
        }
        return filtered;
      });

      showToast("Sesi berhasil dihapus.");
      return true;
    } catch (err: any) {
      console.error("Failed to delete session", err);
      throw err;
    }
  };

  // Join Session by Code
  const handleJoinSessionCode = async (code: string) => {
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(code.trim().toUpperCase())}`);
      if (res.ok) {
        const found: Session = await res.json();
        setActiveSessionId(found.id);
        setActiveSession(found);
        showToast(`Bergabung ke sesi "${found.title}"`);
      } else {
        alert(`Sesi dengan kode "${code}" tidak ditemukan.`);
      }
    } catch (err) {
      console.error("Join code failed", err);
    }
  };

  // -------------------------------------------------------------
  // QUESTION CRUD HANDLERS
  // -------------------------------------------------------------

  // Create Question
  const handlePostQuestion = async (author: string, content: string) => {
    if (!activeSessionId) return;
    try {
      const res = await fetch(`/api/sessions/${activeSessionId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) {
        const newQuestion: Question = await res.json();
        setActiveSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            questions: [newQuestion, ...prev.questions],
            activeParticipants: prev.activeParticipants + 1,
          };
        });
        showToast("Pertanyaan berhasil dikirim & dianalisis oleh AI!");
      }
    } catch (err) {
      console.error("Error posting question", err);
      showToast("Gagal mengirim pertanyaan.");
    }
  };

  // Vote Question (Upvote / Downvote)
  const handleVoteQuestion = async (questionId: string, type: "up" | "down") => {
    if (!activeSession) return;

    // Optimistic UI update
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id === questionId) {
            const hasVoted = q.votedUserIds.includes(userId);
            const upChange = type === "up" ? 1 : 0;
            const downChange = type === "down" ? 1 : 0;
            return {
              ...q,
              upvotes: q.upvotes + upChange,
              downvotes: q.downvotes + downChange,
              votedUserIds: hasVoted ? q.votedUserIds : [...q.votedUserIds, userId],
            };
          }
          return q;
        }),
      };
    });

    try {
      await fetch(`/api/sessions/${activeSession.id}/questions/${questionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, userId }),
      });
    } catch (err) {
      console.error("Failed to vote", err);
      fetchActiveSessionDetails(activeSession.id);
    }
  };

  // Update Question (Content, Category, Note, Status, Suggested Answer)
  const handleUpdateQuestion = async (
    questionId: string,
    updates: {
      content?: string;
      author?: string;
      status?: QuestionStatus;
      aiCategory?: string;
      organizerNote?: string;
      aiSuggestedAnswer?: string;
    }
  ): Promise<boolean> => {
    if (!activeSession) return false;

    // Optimistic update
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
      };
    });

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui pertanyaan.");
      }

      showToast("Perubahan pertanyaan berhasil disimpan.");
      return true;
    } catch (err: any) {
      console.error("Failed to update question", err);
      fetchActiveSessionDetails(activeSession.id);
      throw err;
    }
  };

  // Update Question Status (Moderation: pin, answer, hide, approve)
  const handleUpdateQuestionStatus = async (
    questionId: string,
    status: QuestionStatus,
    note?: string
  ) => {
    await handleUpdateQuestion(questionId, { status, organizerNote: note });
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string): Promise<boolean> => {
    if (!activeSession) return false;

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghapus pertanyaan.");
      }

      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.filter((q) => q.id !== questionId),
        };
      });

      showToast("Pertanyaan berhasil dihapus.");
      return true;
    } catch (err: any) {
      console.error("Failed to delete question", err);
      throw err;
    }
  };

  // Generate AI Summary
  const handleGenerateAiSummary = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/ai-summary`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession((prev) => (prev ? { ...prev, aiExecutiveSummary: data.summary } : null));
        showToast("Ringkasan Eksekutif AI berhasil dibuat!");
      }
    } catch (err) {
      console.error("Failed to generate AI summary", err);
      showToast("Gagal menghasilkan ringkasan AI.");
    }
  };

  // Open Modal Helpers
  const handleOpenCreateSessionModal = () => {
    setSessionModalTarget(null);
    setIsSessionModalOpen(true);
  };

  const handleOpenEditSessionModal = () => {
    if (activeSession) {
      setSessionModalTarget(activeSession);
      setIsSessionModalOpen(true);
    }
  };

  const handleOpenEditQuestionModal = (question: Question) => {
    setQuestionToEdit(question);
    setIsEditQuestionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-300">Memuat Sesi Q&A Live & Pembobotan AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Toast / Notification Banner */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center space-x-2 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>{statusNotification}</span>
          </div>
        </div>
      )}

      {/* App Header (Hidden in Presenter Mode for clean full-stage look) */}
      {currentView !== "presenter" && (
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={(id) => setActiveSessionId(id)}
          onOpenCreateSession={handleOpenCreateSessionModal}
          onOpenEditSession={handleOpenEditSessionModal}
          onOpenQrModal={() => setIsQrModalOpen(true)}
        />
      )}

      {/* Main View Container */}
      <main className="flex-1">
        {activeSession ? (
          <>
            {currentView === "participant" && (
              <ParticipantView
                session={activeSession}
                userId={userId}
                onPostQuestion={handlePostQuestion}
                onVoteQuestion={handleVoteQuestion}
                onOpenQrModal={() => setIsQrModalOpen(true)}
              />
            )}

            {currentView === "organizer" && (
              <OrganizerDashboard
                session={activeSession}
                onUpdateQuestionStatus={handleUpdateQuestionStatus}
                onGenerateAiSummary={handleGenerateAiSummary}
                onOpenCreateSession={handleOpenCreateSessionModal}
                onOpenEditSession={handleOpenEditSessionModal}
                onOpenEditQuestion={handleOpenEditQuestionModal}
                onDeleteQuestion={handleDeleteQuestion}
              />
            )}

            {currentView === "presenter" && (
              <PresenterStageView
                session={activeSession}
                onUpdateQuestionStatus={handleUpdateQuestionStatus}
              />
            )}
          </>
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Belum Ada Sesi Q&A Aktif
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mulai sesi tanya jawab interaktif baru dengan pembobotan cerdas AI untuk audiens Anda sekarang.
            </p>
            <button
              id="empty-state-create-btn"
              type="button"
              onClick={handleOpenCreateSessionModal}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Sesi Q&A Pertama</span>
            </button>
          </div>
        )}
      </main>

      {/* Centered Pop-up Modal for Create & Edit Sessions */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
        initialSession={sessionModalTarget}
      />

      {/* Centered Pop-up Modal for Edit Question */}
      <EditQuestionModal
        isOpen={isEditQuestionModalOpen}
        onClose={() => {
          setIsEditQuestionModalOpen(false);
          setQuestionToEdit(null);
        }}
        question={questionToEdit}
        onSave={handleUpdateQuestion}
        onDelete={handleDeleteQuestion}
      />

      {/* QR Code & Scanner Modal */}
      {activeSession && (
        <QrScannerModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          sessionCode={activeSession.code}
          sessionTitle={activeSession.title}
          onJoinSessionCode={handleJoinSessionCode}
        />
      )}

    </div>
  );
}

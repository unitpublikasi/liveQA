import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ParticipantView } from "./components/ParticipantView";
import { PresenterStageView } from "./components/PresenterStageView";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { QrScannerModal } from "./components/QrScannerModal";
import { Session, Question } from "./types";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [currentView, setCurrentView] = useState<"participant" | "organizer" | "presenter">("participant");
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate or retrieve persistent local user ID for vote tracking
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("liveq_user_id");
      if (stored) return stored;
      const newId = `user-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("liveq_user_id", newId);
      return newId;
    }
    return "user-anon";
  });

  // Fetch session list
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          // Check query param for code
          const urlParams = new URLSearchParams(window.location.search);
          const codeParam = urlParams.get("code");
          if (codeParam) {
            const found = data.find((s: any) => s.code.toUpperCase() === codeParam.toUpperCase());
            if (found) {
              setActiveSessionId(found.id);
              return;
            }
          }
          setActiveSessionId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch full details for active session
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const fetchActiveSessionDetails = async (sessionId: string) => {
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
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchActiveSessionDetails(activeSessionId);
    }
  }, [activeSessionId]);

  // Handle Join Session by Code
  const handleJoinSessionCode = async (code: string) => {
    try {
      const res = await fetch(`/api/sessions/${code}`);
      if (res.ok) {
        const found: Session = await res.json();
        setActiveSessionId(found.id);
        setActiveSession(found);
      } else {
        alert(`Sesi dengan kode "${code}" tidak ditemukan.`);
      }
    } catch (err) {
      console.error("Join code failed", err);
    }
  };

  // Submit Question
  const handlePostQuestion = async (author: string, content: string) => {
    if (!activeSessionId) return;
    try {
      const res = await fetch(`/api/sessions/${activeSessionId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) {
        await fetchActiveSessionDetails(activeSessionId);
      }
    } catch (err) {
      console.error("Error posting question", err);
    }
  };

  // Vote Question
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
      // Revert if error
      fetchActiveSessionDetails(activeSession.id);
    }
  };

  // Update Question Status (Moderation)
  const handleUpdateQuestionStatus = async (
    questionId: string,
    status: Question["status"],
    note?: string
  ) => {
    if (!activeSession) return;

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              status,
              organizerNote: note !== undefined ? note : q.organizerNote,
            };
          }
          return q;
        }),
      };
    });

    try {
      await fetch(`/api/sessions/${activeSession.id}/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, organizerNote: note }),
      });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchActiveSessionDetails(activeSession.id);
    }
  };

  // Create New Session
  const handleCreateSession = async (
    title: string,
    speaker: string,
    description: string,
    code: string
  ) => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, speaker, description, code }),
      });
      if (res.ok) {
        const newSess: Session = await res.json();
        setSessions((prev) => [newSess, ...prev]);
        setActiveSessionId(newSess.id);
        setActiveSession(newSess);
      }
    } catch (err) {
      console.error("Failed to create session", err);
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
        setActiveSession((prev) => prev ? { ...prev, aiExecutiveSummary: data.summary } : null);
      }
    } catch (err) {
      console.error("Failed to generate AI summary", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-300">Memuat Sesi Q&A Live & Pembobotan AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* App Header (Hidden in Presenter Mode for clean full-stage look) */}
      {currentView !== "presenter" && (
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={(id) => setActiveSessionId(id)}
          onCreateSession={handleCreateSession}
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
          <div className="p-12 text-center text-slate-500">
            Sesi Q&A tidak ditemukan. Buat sesi baru melalui menu atas.
          </div>
        )}
      </main>

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

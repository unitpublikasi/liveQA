import { Question, Session, SessionAnalytics } from "../types";

// Helper to safely parse JSON or return human-readable error
async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (networkErr: any) {
    throw new Error(networkErr?.message || "Gagal terhubung ke server. Periksa koneksi internet Anda.");
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  let data: any = null;
  if (contentType.includes("application/json") || (text.startsWith("{") || text.startsWith("["))) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || (text.length < 120 ? text : `Server error (${res.status})`);
    throw new Error(errorMsg);
  }

  if (data === null) {
    // If not JSON but 200 OK
    return text as unknown as T;
  }

  return data as T;
}

export const api = {
  // Get all session summaries
  getSessions: async (): Promise<Session[]> => {
    return safeFetch<Session[]>("/api/sessions");
  },

  // Get specific session details
  getSession: async (idOrCode: string): Promise<Session> => {
    return safeFetch<Session>(`/api/sessions/${encodeURIComponent(idOrCode)}`);
  },

  // Create a new session
  createSession: async (sessionData: {
    title: string;
    speaker: string;
    description: string;
    code?: string;
    allowAnonymous?: boolean;
    autoApprove?: boolean;
  }): Promise<Session> => {
    return safeFetch<Session>("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });
  },

  // Update session
  updateSession: async (
    sessionId: string,
    sessionData: {
      title?: string;
      speaker?: string;
      description?: string;
      code?: string;
      status?: "active" | "paused" | "ended";
      allowAnonymous?: boolean;
      autoApprove?: boolean;
    }
  ): Promise<Session> => {
    return safeFetch<Session>(`/api/sessions/${encodeURIComponent(sessionId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });
  },

  // Delete session
  deleteSession: async (sessionId: string): Promise<{ message: string; deletedSession: Session }> => {
    return safeFetch<{ message: string; deletedSession: Session }>(`/api/sessions/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
  },

  // Add question
  createQuestion: async (
    sessionId: string,
    questionData: { author: string; content: string }
  ): Promise<Question> => {
    return safeFetch<Question>(`/api/sessions/${encodeURIComponent(sessionId)}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
  },

  // Vote question
  voteQuestion: async (
    sessionId: string,
    questionId: string,
    voteData: { type: "up" | "down"; userId: string }
  ): Promise<Question> => {
    return safeFetch<Question>(`/api/sessions/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voteData),
    });
  },

  // Moderate / Edit question
  updateQuestion: async (
    sessionId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<Question> => {
    return safeFetch<Question>(`/api/sessions/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  },

  // Delete question
  deleteQuestion: async (sessionId: string, questionId: string): Promise<{ message: string; deletedQuestion: Question }> => {
    return safeFetch<{ message: string; deletedQuestion: Question }>(
      `/api/sessions/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}`,
      {
        method: "DELETE",
      }
    );
  },

  // Analytics
  getAnalytics: async (sessionId: string): Promise<SessionAnalytics> => {
    return safeFetch<SessionAnalytics>(`/api/sessions/${encodeURIComponent(sessionId)}/analytics`);
  },

  // Generate AI Executive Summary
  generateAiSummary: async (sessionId: string): Promise<{ summary: string }> => {
    return safeFetch<{ summary: string }>(`/api/sessions/${encodeURIComponent(sessionId)}/ai-summary`, {
      method: "POST",
    });
  },
};

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Session, SessionAnalytics } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-Memory Storage for Q&A Sessions
let sessions: Session[] = [
  {
    id: "sess-1",
    code: "INOVASI-2026",
    title: "Simposium Nasional Inovasi Digital & Kecerdasan Buatan 2026",
    speaker: "Dr. Budi Santoso & Tim Riset AI",
    description: "Sesi tanya jawab interaktif mengenai implementasi AI dalam operasional dan strategi industri modern.",
    createdAt: Date.now() - 3600000 * 2,
    status: "active",
    activeParticipants: 184,
    allowAnonymous: true,
    autoApprove: true,
    aiExecutiveSummary: "Peserta sangat antusias menanyakan integrasi AI dengan keamanan data, dampak terhadap efisiensi SDM, serta kesiapan regulasi di Indonesia. Pertanyaan teratas memiliki fokus strategis dan kepraktisan implementasi.",
    questions: [
      {
        id: "q-101",
        sessionId: "sess-1",
        author: "Ahmad Rizky (Telkom)",
        content: "Bagaimana strategi mitigasi risiko privasi dan keamanan data sensitif perusahaan saat mengadopsi model Large Language Model (LLM) pada sistem internal?",
        timestamp: Date.now() - 3200000,
        upvotes: 42,
        downvotes: 1,
        votedUserIds: [],
        status: "pinned",
        aiScore: 96,
        aiWeight: 148.2,
        aiCategory: "Keamanan & Regulasi",
        aiTags: ["LLM", "Data Privacy", "Mitigasi Risiko", "Sistem Internal"],
        aiReasoning: "Pertanyaan sangat relevan, terstruktur, serta memiliki dampak strategis tinggi bagi adopsi teknologi di sektor korporasi.",
        aiSuggestedAnswer: "1. Gunakan Private VPC / On-Premise LLM deployment.\n2. Terapkan Data Anonymization layer sebelum prompt dikirim.\n3. Implementasikan Role-Based Access Control (RBAC) ketat pada RAG (Retrieval Augmented Generation).",
        organizerNote: "Pertanyaan prioritas utama untuk dijawab oleh Dr. Budi."
      },
      {
        id: "q-102",
        sessionId: "sess-1",
        author: "Anonim",
        content: "Apakah biaya investasi awal infrastruktur AI skala menengah sebanding dengan ROI efisiensi dalam jangka waktu 1-2 tahun pertama?",
        timestamp: Date.now() - 2800000,
        upvotes: 35,
        downvotes: 2,
        votedUserIds: [],
        status: "approved",
        aiScore: 91,
        aiWeight: 125.5,
        aiCategory: "Strategi & Investasi",
        aiTags: ["ROI", "Investasi", "Efisiensi Biaya", "UKM/Korporasi"],
        aiReasoning: "Fokus finansial yang tajam dan pragmatis, banyak diminati oleh eksekutif dan pemilik bisnis.",
        aiSuggestedAnswer: "ROI sangat bergantung pada kasus penggunaan. Untuk otomatisasi layanan pelanggan dan pengolahan dokumen, ROI biasanya tercapai dalam 6-9 bulan melalui penghematan jam kerja.",
      },
      {
        id: "q-103",
        sessionId: "sess-1",
        author: "Dewi Kartika",
        content: "Bagaimana cara melatih ulang (upskilling) tenaga kerja tradisional agar tidak merasa terancam dengan otomatisasi AI di lingkungan kerja?",
        timestamp: Date.now() - 2400000,
        upvotes: 28,
        downvotes: 0,
        votedUserIds: [],
        status: "answered",
        aiScore: 88,
        aiWeight: 112.4,
        aiCategory: "SDM & Budaya",
        aiTags: ["Upskilling", "Change Management", "Budaya Kerja"],
        aiReasoning: "Menyentuh aspek kemanusiaan dan manajemen perubahan (Change Management) yang krusial bagi keberhasilan transformasi.",
        aiSuggestedAnswer: "Fokus pada AI-Augmentation (AI sebagai asisten, bukan pengganti). Buat program sertifikasi internal dan insentif pembelajaran.",
      },
      {
        id: "q-104",
        sessionId: "sess-1",
        author: "Fajar Nugraha",
        content: "Bisakah contoh kasus konkret integrasi Gemini API dengan database SQL lokal dijelaskan secara arsitektural?",
        timestamp: Date.now() - 1500000,
        upvotes: 19,
        downvotes: 1,
        votedUserIds: [],
        status: "approved",
        aiScore: 84,
        aiWeight: 89.6,
        aiCategory: "Inovasi & Tekno",
        aiTags: ["Gemini API", "SQL", "Arsitektur Software"],
        aiReasoning: "Teknis dan praktis untuk pengembang perangkat lunak, langsung bisa diterapkan dalam proyek riil.",
        aiSuggestedAnswer: "Gunakan pola Function Calling / Function Declaration di mana Gemini mengubah query bahasa alami menjadi SQL aman melalui ORM terisolasi.",
      },
      {
        id: "q-105",
        sessionId: "sess-1",
        author: "Anonim",
        content: "Acara ini selesai jam berapa ya?",
        timestamp: Date.now() - 900000,
        upvotes: 2,
        downvotes: 5,
        votedUserIds: [],
        status: "approved",
        aiScore: 32,
        aiWeight: 22.1,
        aiCategory: "Operasional",
        aiTags: ["Jadwal", "Administratif"],
        aiReasoning: "Pertanyaan seputar logistik acara sederhana dengan bobot konten teknis rendah.",
        aiSuggestedAnswer: "Sesi Q&A berlangsung hingga pukul 15.30 WIB dilanjutkan dengan penutupan.",
      }
    ]
  },
  {
    id: "sess-2",
    code: "TOWNHALL-Q3",
    title: "Townhall Strategi Perusahaan & Evaluasi Performa Q3",
    speaker: "Board of Directors & Management",
    description: "Sesi terbuka bersama jajaran manajemen untuk mendiskusikan target Q4, kesejahteraan karyawan, dan prioritas bisnis.",
    createdAt: Date.now() - 1800000,
    status: "active",
    activeParticipants: 95,
    allowAnonymous: true,
    autoApprove: true,
    questions: [
      {
        id: "q-201",
        sessionId: "sess-2",
        author: "Anonim",
        content: "Apakah ada rencana penyelarasan fleksibilitas kerja Hybrid (WFH/WFO) dengan indikator kinerja KPI terbaru?",
        timestamp: Date.now() - 1200000,
        upvotes: 22,
        downvotes: 0,
        votedUserIds: [],
        status: "pinned",
        aiScore: 92,
        aiWeight: 106.8,
        aiCategory: "SDM & Budaya",
        aiTags: ["Hybrid Work", "KPI", "Kebijakan Kantor"],
        aiReasoning: "Relevansi sangat tinggi untuk seluruh anggota tim, konstruktif bagi produktivitas dan kepuasan kerja.",
        aiSuggestedAnswer: "Sistem penilaian KPI Q4 akan berfokus pada Outcome & Output, memberikan keleluasaan pengaturan jam kerja berbasis tim.",
      }
    ]
  }
];

// Helper: AI Evaluation function using Gemini
async function evaluateQuestionWithAI(content: string, sessionContext: string) {
  const ai = getGeminiClient();

  if (!ai) {
    // Fallback heuristic scoring if no GEMINI_API_KEY
    const wordCount = content.split(" ").length;
    const isQuestionMark = content.includes("?");
    let score = 60 + Math.min(wordCount * 2, 25) + (isQuestionMark ? 10 : 0);
    if (score > 98) score = 98;

    let category = "Umum";
    const lower = content.toLowerCase();
    if (lower.includes("ai") || lower.includes("teknologi") || lower.includes("sistem") || lower.includes("data")) {
      category = "Inovasi & Tekno";
    } else if (lower.includes("biaya") || lower.includes("investasi") || lower.includes("strategi") || lower.includes("target")) {
      category = "Strategi & Kebijakan";
    } else if (lower.includes("sdm") || lower.includes("karyawan") || lower.includes("gaji") || lower.includes("tim")) {
      category = "SDM & Budaya";
    } else if (lower.includes("jadwal") || lower.includes("acara") || lower.includes("operasional")) {
      category = "Operasional";
    }

    return {
      aiScore: Math.round(score),
      aiCategory: category,
      aiTags: ["Penting", category.split(" ")[0]],
      aiReasoning: "Dievaluasi berdasarkan kejelasan kata, relevansi topik, dan struktur pertanyaan.",
      aiSuggestedAnswer: "Poin jawaban utama: Jelaskan garis besar solusi, berikan contoh konkret, dan susun langkah tindak lanjut.",
    };
  }

  try {
    const prompt = `Anda adalah Asisten Analis AI untuk Sesi Q&A Live dan Conference Presentation.
Tugas Anda adalah mengevaluasi kebagusan, kedalaman, dan relevansi pertanyaan peserta berikut.

Konteks Acara: "${sessionContext}"
Pertanyaan Peserta: "${content}"

Evaluasi pertanyaan ini dan kembalikan JSON dengan format persis berikut:
- aiScore: angka 0 hingga 100 (100 = sangat bagus, tajam, konstruktif, relevan dengan topik; <50 = pertanyaan asal-asalan, spaming, atau terlalu sepele).
- aiCategory: pilih satu kategori terbaik dari ['Inovasi & Tekno', 'Strategi & Kebijakan', 'Operasional', 'SDM & Budaya', 'Keamanan & Regulasi', 'Umum'].
- aiTags: array kata kunci / topik penting (maksimal 4 tag pendek).
- aiReasoning: penjelasan singkat 1-2 kalimat dalam Bahasa Indonesia mengapa pertanyaan diberi skor tersebut.
- aiSuggestedAnswer: 2-3 poin ringkas dalam Bahasa Indonesia sebagai saran pencerahan/jawaban bagi pembicara saat menjawab.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiScore: { type: Type.INTEGER, description: "Skor kualitas 0-100" },
            aiCategory: { type: Type.STRING, description: "Kategori pertanyaan" },
            aiTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Tag topik kata kunci",
            },
            aiReasoning: { type: Type.STRING, description: "Alasan pembobotan AI" },
            aiSuggestedAnswer: { type: Type.STRING, description: "Rangkuman saran jawaban untuk speaker" },
          },
          required: ["aiScore", "aiCategory", "aiTags", "aiReasoning", "aiSuggestedAnswer"],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        aiScore: Math.min(Math.max(parsed.aiScore || 70, 0), 100),
        aiCategory: parsed.aiCategory || "Umum",
        aiTags: Array.isArray(parsed.aiTags) ? parsed.aiTags.slice(0, 4) : ["Q&A"],
        aiReasoning: parsed.aiReasoning || "Pertanyaan yang relevan dan dapat didiskusikan.",
        aiSuggestedAnswer: parsed.aiSuggestedAnswer || "Dapat dijawab dengan memberikan arahan strategis.",
      };
    }
  } catch (err) {
    console.error("Gemini AI evaluation error, falling back:", err);
  }

  return {
    aiScore: 75,
    aiCategory: "Umum",
    aiTags: ["Q&A Live"],
    aiReasoning: "Pertanyaan diterima dan diproses oleh sistem.",
    aiSuggestedAnswer: "Fokus pada poin inti pertanyaan.",
  };
}

// Calculate combined Smart Weight for Auto-Sorting
function calculateWeight(upvotes: number, downvotes: number, aiScore: number, timestamp: number): number {
  const voteNet = upvotes - downvotes;
  // Weight Formula: (Net Votes * 1.8) + (AI Quality Score * 0.95) + Recency Decay Bonus
  const hoursAgo = (Date.now() - timestamp) / (1000 * 3600);
  const recencyBonus = Math.max(0, 10 - hoursAgo * 2);
  const weight = voteNet * 1.8 + aiScore * 0.95 + recencyBonus;
  return Number(weight.toFixed(1));
}

/* API Endpoints */

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

// Get all sessions
app.get("/api/sessions", (req, res) => {
  try {
    const summaryList = sessions.map((s) => ({
      id: s.id,
      code: s.code,
      title: s.title,
      speaker: s.speaker,
      description: s.description,
      status: s.status,
      createdAt: s.createdAt,
      activeParticipants: s.activeParticipants,
      questionCount: s.questions.length,
      topScore: s.questions.length > 0 ? Math.max(...s.questions.map((q) => q.aiScore)) : 0,
    }));
    return res.json(summaryList);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal memuat sesi." });
  }
});

// Create new session
app.post("/api/sessions", (req, res) => {
  try {
    const { title, speaker, description, code, allowAnonymous, autoApprove } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Judul Sesi wajib diisi." });
    }
    if (!speaker || !String(speaker).trim()) {
      return res.status(400).json({ error: "Nama Pembicara wajib diisi." });
    }

    const generatedCode = code && String(code).trim()
      ? String(code).trim().toUpperCase()
      : `LIVE-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession: Session = {
      id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: generatedCode,
      title: String(title).trim(),
      speaker: String(speaker).trim(),
      description: description ? String(description).trim() : "Sesi Tanya Jawab Real-Time",
      createdAt: Date.now(),
      status: "active",
      activeParticipants: Math.floor(Math.random() * 10) + 1,
      allowAnonymous: allowAnonymous !== false,
      autoApprove: autoApprove !== false,
      questions: [],
    };

    sessions.unshift(newSession);
    return res.status(201).json(newSession);
  } catch (err: any) {
    console.error("Session creation error:", err);
    return res.status(500).json({ error: err?.message || "Gagal membuat sesi baru." });
  }
});

// Get session by ID or Code
app.get("/api/sessions/:idOrCode", (req, res) => {
  try {
    const key = req.params.idOrCode.toUpperCase();
    const session = sessions.find((s) => s.id === req.params.idOrCode || s.code.toUpperCase() === key);
    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }
    return res.json(session);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal mengambil detail sesi." });
  }
});

// Update session details (Title, Speaker, Description, Code, Status, Options)
app.patch("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, speaker, description, code, status, allowAnonymous, autoApprove } = req.body || {};

    const session = sessions.find((s) => s.id === sessionId || s.code.toUpperCase() === sessionId.toUpperCase());
    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    if (title !== undefined && String(title).trim()) session.title = String(title).trim();
    if (speaker !== undefined && String(speaker).trim()) session.speaker = String(speaker).trim();
    if (description !== undefined) session.description = String(description).trim();
    if (code !== undefined && String(code).trim()) session.code = String(code).trim().toUpperCase();
    if (status !== undefined) session.status = status;
    if (allowAnonymous !== undefined) session.allowAnonymous = Boolean(allowAnonymous);
    if (autoApprove !== undefined) session.autoApprove = Boolean(autoApprove);

    return res.json(session);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal memperbarui sesi." });
  }
});

// Delete a session
app.delete("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const index = sessions.findIndex((s) => s.id === sessionId || s.code.toUpperCase() === sessionId.toUpperCase());
    if (index === -1) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    const deleted = sessions.splice(index, 1)[0];
    return res.json({ message: "Sesi berhasil dihapus.", deletedSession: deleted });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal menghapus sesi." });
  }
});

// Submit a new question
app.post("/api/sessions/:sessionId/questions", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { author, content } = req.body || {};

    const session = sessions.find((s) => s.id === sessionId || s.code.toUpperCase() === sessionId.toUpperCase());
    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    if (!content || String(content).trim().length < 3) {
      return res.status(400).json({ error: "Pertanyaan minimal 3 karakter." });
    }

    const authorName = author && String(author).trim() ? String(author).trim() : "Anonim";

    // AI Quality Evaluation
    const aiEval = await evaluateQuestionWithAI(String(content).trim(), `${session.title} oleh ${session.speaker}`);
    const initialWeight = calculateWeight(0, 0, aiEval.aiScore, Date.now());

    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId: session.id,
      author: authorName,
      content: String(content).trim(),
      timestamp: Date.now(),
      upvotes: 0,
      downvotes: 0,
      votedUserIds: [],
      status: session.autoApprove ? "approved" : "pending",
      aiScore: aiEval.aiScore,
      aiWeight: initialWeight,
      aiCategory: aiEval.aiCategory,
      aiTags: aiEval.aiTags,
      aiReasoning: aiEval.aiReasoning,
      aiSuggestedAnswer: aiEval.aiSuggestedAnswer,
    };

    session.questions.push(newQuestion);
    session.activeParticipants += 1;

    return res.status(201).json(newQuestion);
  } catch (err: any) {
    console.error("Error submitting question:", err);
    return res.status(500).json({ error: err?.message || "Gagal mengirim pertanyaan." });
  }
});

// Upvote / Downvote question
app.post("/api/sessions/:sessionId/questions/:questionId/vote", (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const { type, userId } = req.body || {}; // type: 'up' | 'down'

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: "Pertanyaan tidak ditemukan." });
    }

    if (type === "up") {
      question.upvotes += 1;
    } else if (type === "down") {
      question.downvotes += 1;
    }

    if (userId && !question.votedUserIds.includes(userId)) {
      question.votedUserIds.push(userId);
    }

    // Recalculate AI Smart Weight
    question.aiWeight = calculateWeight(question.upvotes, question.downvotes, question.aiScore, question.timestamp);

    return res.json(question);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal memproses vote." });
  }
});

// Update question status, content, or organizer note (Moderation & Edit)
app.patch("/api/sessions/:sessionId/questions/:questionId", (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const { status, organizerNote, aiSuggestedAnswer, content, author, aiCategory } = req.body || {};

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: "Pertanyaan tidak ditemukan." });
    }

    if (status !== undefined) question.status = status;
    if (organizerNote !== undefined) question.organizerNote = organizerNote;
    if (aiSuggestedAnswer !== undefined) question.aiSuggestedAnswer = aiSuggestedAnswer;
    if (content !== undefined && String(content).trim()) question.content = String(content).trim();
    if (author !== undefined && String(author).trim()) question.author = String(author).trim();
    if (aiCategory !== undefined && String(aiCategory).trim()) question.aiCategory = String(aiCategory).trim();

    return res.json(question);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal memperbarui pertanyaan." });
  }
});

// Delete a question
app.delete("/api/sessions/:sessionId/questions/:questionId", (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    const index = session.questions.findIndex((q) => q.id === questionId);
    if (index === -1) {
      return res.status(404).json({ error: "Pertanyaan tidak ditemukan." });
    }

    const deleted = session.questions.splice(index, 1)[0];
    return res.json({ message: "Pertanyaan berhasil dihapus.", deletedQuestion: deleted });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal menghapus pertanyaan." });
  }
});

// Organizer Analytics Endpoint
app.get("/api/sessions/:sessionId/analytics", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.find((s) => s.id === sessionId || s.code.toUpperCase() === sessionId.toUpperCase());

    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    const questions = session.questions.filter((q) => q.status !== "hidden");
    const totalQuestions = questions.length;
    const totalVotes = questions.reduce((acc, q) => acc + q.upvotes, 0);
    const avgAiScore = totalQuestions > 0 ? Math.round(questions.reduce((acc, q) => acc + q.aiScore, 0) / totalQuestions) : 0;
    const answeredCount = questions.filter((q) => q.status === "answered").length;
    const pinnedCount = questions.filter((q) => q.status === "pinned").length;

    // Category Distribution
    const categoryMap: Record<string, { count: number; totalScore: number }> = {};
    questions.forEach((q) => {
      const cat = q.aiCategory || "Umum";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, totalScore: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].totalScore += q.aiScore;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      count: data.count,
      percentage: totalQuestions > 0 ? Math.round((data.count / totalQuestions) * 100) : 0,
      avgScore: Math.round(data.totalScore / data.count),
    }));

    // Timeline data points
    const activityTimeline = [
      { time: "10:00", questionCount: Math.max(1, Math.floor(totalQuestions * 0.1)), voteCount: Math.floor(totalVotes * 0.1) },
      { time: "10:15", questionCount: Math.max(2, Math.floor(totalQuestions * 0.25)), voteCount: Math.floor(totalVotes * 0.3) },
      { time: "10:30", questionCount: Math.max(4, Math.floor(totalQuestions * 0.55)), voteCount: Math.floor(totalVotes * 0.65) },
      { time: "10:45", questionCount: totalQuestions, voteCount: totalVotes },
    ];

    // Top Ranked Questions
    const topRankedQuestions = [...questions].sort((a, b) => b.aiWeight - a.aiWeight).slice(0, 5);

    const analytics: SessionAnalytics = {
      totalQuestions,
      totalVotes,
      avgAiScore,
      answeredCount,
      pinnedCount,
      activeParticipants: session.activeParticipants,
      categoryDistribution,
      activityTimeline,
      sentimentBreakdown: {
        constructive: Math.round(totalQuestions * 0.72) || 0,
        neutral: Math.round(totalQuestions * 0.2) || 0,
        critical: Math.round(totalQuestions * 0.08) || 0,
      },
      topRankedQuestions,
    };

    return res.json(analytics);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Gagal mengambil data analitik." });
  }
});

// Trigger AI Executive Summary for Session
app.post("/api/sessions/:sessionId/ai-summary", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ error: "Sesi tidak ditemukan." });
    }

    const ai = getGeminiClient();
    const questionTexts = session.questions.map((q, idx) => `${idx + 1}. [Vote:${q.upvotes}|SkorAI:${q.aiScore}] ${q.content}`).join("\n");

    if (!ai || session.questions.length === 0) {
      session.aiExecutiveSummary = "Ringkasan Otomatis: Peserta berfokus pada strategi kualitatif, keamanan, dan dampak efisiensi bisnis.";
      return res.json({ summary: session.aiExecutiveSummary });
    }

    const prompt = `Anda adalah Analis Acara Eksekutif.
Berikut daftar pertanyaan dari sesi: "${session.title}".
Daftar Pertanyaan:
${questionTexts}

Buatlah ringkasan eksekutif 2-3 paragraf ringkas dalam Bahasa Indonesia untuk penyelenggara acara yang mencakup:
1. Tema utama yang paling menarik perhatian peserta.
2. Sentimen umum dan tingkat kekritisan pertanyaan.
3. Rekomendasi tindakan atau follow-up pasca acara untuk pembicara/penyelenggara.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    session.aiExecutiveSummary = response.text || "Ringkasan berhasil dibuat.";
    return res.json({ summary: session.aiExecutiveSummary });
  } catch (err: any) {
    console.error("Failed to generate AI executive summary:", err);
    return res.status(500).json({ error: "Gagal membuat ringkasan AI." });
  }
});

// API 404 Handler - MUST be before Vite to guarantee all unmatched /api routes return JSON, never HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.path} tidak ditemukan.` });
});

// Global API error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api")) {
    console.error("API Error Middleware caught:", err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
  next(err);
});

// Start Express Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LiveQ Q&A backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export type QuestionStatus = 'pending' | 'approved' | 'pinned' | 'answered' | 'archived' | 'hidden';

export type SortOption = 'smart_ai' | 'most_voted' | 'highest_ai_score' | 'newest' | 'answered';

export interface Question {
  id: string;
  sessionId: string;
  author: string;
  content: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  votedUserIds: string[]; // local browser vote tracking
  status: QuestionStatus;
  aiScore: number; // 0 - 100 quality score
  aiWeight: number; // calculated total weight
  aiCategory: string; // e.g., 'Inovasi & Tekno', 'Strategi & Kebijakan', 'Operasional', 'SDM & Budaya', 'Lainnya'
  aiTags: string[];
  aiReasoning: string; // concise explanation why AI assigned this score
  aiSuggestedAnswer?: string; // key bullet points for speaker response
  organizerNote?: string;
}

export interface Session {
  id: string;
  code: string;
  title: string;
  speaker: string;
  description: string;
  createdAt: number;
  status: 'active' | 'paused' | 'ended';
  activeParticipants: number;
  allowAnonymous: boolean;
  autoApprove: boolean;
  questions: Question[];
  aiExecutiveSummary?: string;
  topTopics?: { topic: string; count: number }[];
}

export interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
  avgScore: number;
}

export interface ActivityTimelinePoint {
  time: string;
  questionCount: number;
  voteCount: number;
}

export interface SessionAnalytics {
  totalQuestions: number;
  totalVotes: number;
  avgAiScore: number;
  answeredCount: number;
  pinnedCount: number;
  activeParticipants: number;
  categoryDistribution: CategoryDistribution[];
  activityTimeline: ActivityTimelinePoint[];
  sentimentBreakdown: {
    constructive: number;
    neutral: number;
    critical: number;
  };
  topRankedQuestions: Question[];
}

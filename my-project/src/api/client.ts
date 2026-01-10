const API = window.location.origin.includes('localhost') ? "http://127.0.0.1:8000" : "";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface Quiz {
  id?: number;
  title: string;
  url: string;
  quiz: QuizQuestion[];
  related_topics: string[];
  related_links: string[];
}

export interface QuizHistoryItem {
  id?: number;
  title: string;
  url: string;
  created_at: string;
}

export interface AttemptResult {
  score: number;
  total: number;
}

export async function generateQuiz(url: string): Promise<Quiz> {
  const res = await fetch(`${API}/api/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function fetchHistory(): Promise<QuizHistoryItem[]> {
  const res = await fetch(`${API}/api/quizzes`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchQuiz(id: number | string): Promise<Quiz> {
  const res = await fetch(`${API}/api/quizzes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch quiz");
  return res.json();
}

export async function submitAttempt(id: number | string, answers: Record<string, string>): Promise<AttemptResult> {
  const res = await fetch(`${API}/api/quizzes/${id || 'temp'}/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error("Failed to submit attempt");
  return res.json();
}

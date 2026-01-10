import { useState, useEffect } from "react";
import { fetchHistory, QuizHistoryItem } from "@/api/client";
import QuizCard from "@/components/QuizCard";
import QuizDetailsModal from "@/components/QuizDetailsModal";
import { History as HistoryIcon, Loader2, FileQuestion } from "lucide-react";

export default function History() {
  const [quizzes, setQuizzes] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        setQuizzes(data);
      } catch (err) {
        setError("Failed to load quiz history");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <HistoryIcon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quiz History</h1>
          <p className="text-muted-foreground">View and review your past quizzes</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-destructive mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Try Again
          </button>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl card-shadow">
          <FileQuestion className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Quizzes Yet</h3>
          <p className="text-muted-foreground">
            Generate your first quiz to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onViewDetails={setSelectedQuizId}
            />
          ))}
        </div>
      )}

      {selectedQuizId && (
        <QuizDetailsModal
          quizId={selectedQuizId}
          onClose={() => setSelectedQuizId(null)}
        />
      )}
    </div>
  );
}

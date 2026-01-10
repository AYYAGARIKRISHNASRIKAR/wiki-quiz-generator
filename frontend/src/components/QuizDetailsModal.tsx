import { useEffect, useState, useCallback } from "react";
import { Quiz, fetchQuiz } from "@/api/client";
import { getDifficultyClass, getDifficultyCount } from "@/utils/helper";
import RelatedResources from "./RelatedResources";
import { X, ExternalLink, Loader2 } from "lucide-react";

interface QuizDetailsModalProps {
  quizId: number;
  onClose: () => void;
}

export default function QuizDetailsModal({ quizId, onClose }: QuizDetailsModalProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchQuiz(quizId);
        setQuiz(data);
      } catch (err) {
        setError("Failed to load quiz details");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const difficultyCount = quiz ? getDifficultyCount(quiz.quiz) : null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content card-shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <button onClick={onClose} className="btn-secondary mt-4">
              Close
            </button>
          </div>
        ) : quiz ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{quiz.title}</h2>
              <a
                href={quiz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View Source Article
              </a>
            </div>

            {/* Difficulty Breakdown */}
            {difficultyCount && (
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="badge-easy">Easy</span>
                  <span className="font-medium">{difficultyCount.easy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-medium">Medium</span>
                  <span className="font-medium">{difficultyCount.medium}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-hard">Hard</span>
                  <span className="font-medium">{difficultyCount.hard}</span>
                </div>
              </div>
            )}

            {/* Questions */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Questions</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {quiz.quiz.map((q, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Q{idx + 1}</span>
                      <span className={getDifficultyClass(q.difficulty)}>{q.difficulty}</span>
                    </div>
                    <p className="text-foreground mb-2">{q.question}</p>
                    <div className="space-y-1 text-sm">
                      {q.options.map((opt, i) => (
                        <p
                          key={i}
                          className={`pl-2 ${
                            opt.charAt(0) === q.answer ? "text-success font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 italic">{q.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Resources */}
            <RelatedResources topics={quiz.related_topics} links={quiz.related_links} />
          </div>
        ) : null}
      </div>
    </>
  );
}

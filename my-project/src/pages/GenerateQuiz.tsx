import { useState } from "react";
import { generateQuiz, Quiz } from "@/api/client";
import TakeQuiz from "@/components/TakeQuiz";
import { Sparkles, Link as LinkIcon, AlertCircle } from "lucide-react";

export default function GenerateQuiz() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await generateQuiz(url);
      setQuiz(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setQuiz(null);
    setUrl("");
    setError(null);
  };

  if (quiz) {
    return <TakeQuiz quiz={quiz} onBack={handleBack} />;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Generate Quiz</h1>
        <p className="text-muted-foreground">
          Enter a Wikipedia URL to generate an AI-powered quiz
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://en.wikipedia.org/wiki/..."
            className="input-field pl-12"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Quiz
            </>
          )}
        </button>
      </form>

      <div className="mt-12 p-6 bg-card rounded-xl card-shadow">
        <h3 className="font-semibold text-foreground mb-3">How it works</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
              1
            </span>
            <span>Paste a Wikipedia article URL</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
              2
            </span>
            <span>AI analyzes the content and generates questions</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
              3
            </span>
            <span>Test your knowledge with 6 questions (easy, medium, hard)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
              4
            </span>
            <span>Get your score and explore related topics</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

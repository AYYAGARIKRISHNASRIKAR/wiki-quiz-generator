import { useState } from "react";
import GenerateQuiz from "./pages/GenerateQuiz";
import History from "./pages/History";
import { BrainCircuit } from "lucide-react";

type Page = "generate" | "history";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("generate");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">Wiki Quiz</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
              </div>
            </div>

            <nav className="flex gap-2">
              <button
                onClick={() => setCurrentPage("generate")}
                className={`nav-link ${currentPage === "generate" ? "active" : ""}`}
              >
                Generate
              </button>
              <button
                onClick={() => setCurrentPage("history")}
                className={`nav-link ${currentPage === "history" ? "active" : ""}`}
              >
                History
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {currentPage === "generate" ? <GenerateQuiz /> : <History />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Generate quizzes from any Wikipedia article using AI
          </p>
        </div>
      </footer>
    </div>
  );
}

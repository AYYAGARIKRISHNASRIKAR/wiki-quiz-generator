import { useState } from "react";
import { Quiz, submitAttempt, AttemptResult } from "@/api/client";
import { extractAnswerLetter, getDifficultyClass, calculatePercentage } from "@/utils/helper";
import RelatedResources from "./RelatedResources";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface TakeQuizProps {
  quiz: Quiz;
  onBack: () => void;
}

export default function TakeQuiz({ quiz, onBack }: TakeQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.quiz[currentIndex];
  const totalQuestions = quiz.quiz.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === totalQuestions;

  const handleSelectOption = (option: string) => {
    if (showResults) return;
    const letter = extractAnswerLetter(option);
    setAnswers((prev) => ({ ...prev, [String(currentIndex)]: letter }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz.id) {
      alert("Quiz ID is missing. Cannot submit.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitAttempt(quiz.id, answers);
      setResult(res);
      setShowResults(true);
      setCurrentIndex(0);
    } catch (error) {
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setShowResults(false);
    setCurrentIndex(0);
  };

  const getOptionClass = (option: string) => {
    const letter = extractAnswerLetter(option);
    const selected = answers[String(currentIndex)] === letter;

    if (!showResults) {
      return selected ? "option-btn selected" : "option-btn";
    }

    const isCorrect = letter === currentQuestion.answer;
    if (isCorrect) return "option-btn correct";
    if (selected && !isCorrect) return "option-btn incorrect";
    return "option-btn opacity-60";
  };

  if (showResults && result) {
    const percentage = calculatePercentage(result.score, result.total);

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Results Header */}
        <div className="bg-card rounded-xl p-8 card-shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">{quiz.title}</p>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{result.score}/{result.total}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={handleRetake} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <button onClick={onBack} className="btn-primary">
              Back to Generate
            </button>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-card rounded-xl p-6 card-shadow">
          <h3 className="text-xl font-semibold mb-4">Question Breakdown</h3>
          <div className="space-y-4">
            {quiz.quiz.map((q, idx) => {
              const userAnswer = answers[String(idx)];
              const isCorrect = userAnswer === q.answer;

              return (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getDifficultyClass(q.difficulty)}>{q.difficulty}</span>
                      </div>
                      <p className="font-medium text-foreground mb-2">{q.question}</p>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          Your answer: <span className={isCorrect ? "text-success font-medium" : "text-destructive font-medium"}>{userAnswer || "Not answered"}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-muted-foreground">
                            Correct answer: <span className="text-success font-medium">{q.answer}</span>
                          </p>
                        )}
                        <p className="text-muted-foreground mt-2 italic">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Related Resources */}
        <RelatedResources topics={quiz.related_topics} links={quiz.related_links} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className={getDifficultyClass(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card rounded-xl p-8 card-shadow-lg">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              className={getOptionClass(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {isLastQuestion && allAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isLastQuestion}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Answer Progress */}
        <div className="mt-6 flex gap-2 justify-center">
          {quiz.quiz.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                idx === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[String(idx)]
                  ? "bg-success/20 text-success border border-success"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-6 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        ← Back to Generate Quiz
      </button>
    </div>
  );
}

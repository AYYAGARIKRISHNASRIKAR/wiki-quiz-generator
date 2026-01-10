import { QuizHistoryItem } from "@/api/client";
import { formatDate } from "@/utils/helper";
import { ExternalLink, Eye } from "lucide-react";

interface QuizCardProps {
  quiz: QuizHistoryItem;
  onViewDetails: (id: number) => void;
}

export default function QuizCard({ quiz, onViewDetails }: QuizCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate mb-1">
            {quiz.title}
          </h3>
          <a
            href={quiz.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline truncate"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{quiz.url}</span>
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            {formatDate(quiz.created_at)}
          </p>
        </div>
        <button
          onClick={() => onViewDetails(quiz.id)}
          className="btn-outline flex items-center gap-2 flex-shrink-0"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
}

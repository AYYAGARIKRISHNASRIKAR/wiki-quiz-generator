export function extractAnswerLetter(option: string): string {
  return option.charAt(0);
}

export function getDifficultyClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "badge-easy";
    case "medium":
      return "badge-medium";
    case "hard":
      return "badge-hard";
    default:
      return "badge-easy";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

export function getDifficultyCount(quiz: { difficulty: string }[]): { easy: number; medium: number; hard: number } {
  return quiz.reduce(
    (acc, q) => {
      const key = q.difficulty.toLowerCase() as "easy" | "medium" | "hard";
      if (key in acc) acc[key]++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );
}

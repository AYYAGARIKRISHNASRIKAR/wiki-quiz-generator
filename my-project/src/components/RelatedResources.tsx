import { ExternalLink, BookOpen } from "lucide-react";

interface RelatedResourcesProps {
  topics: string[];
  links: string[];
}

export default function RelatedResources({ topics, links }: RelatedResourcesProps) {
  if (topics.length === 0 && links.length === 0) return null;

  return (
    <div className="animate-fade-in space-y-6">
      {topics.length > 0 && (
        <div className="bg-card rounded-xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Related Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-secondary rounded-full text-sm text-secondary-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="bg-card rounded-xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Explore More</h3>
          </div>
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline transition-colors"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import QuizCard from './QuizCard';

export default function QuizDetailsPanel({ quiz, onClose }) {
    if (!quiz) return null;

    const countDifficulty = (questions) => {
        const counts = { easy: 0, medium: 0, hard: 0 };
        questions.forEach((q) => {
            const difficulty = q.difficulty?.toLowerCase() || 'medium';
            if (difficulty in counts) counts[difficulty]++;
        });
        return counts;
    };

    const difficulty = countDifficulty(quiz.quiz);

    return (
        <div className="quiz-details-panel">
            {/* Close Button */}
            <button className="panel-close-button" onClick={onClose} aria-label="Close details">
                ✕
            </button>

            {/* Header Section */}
            <div className="panel-header">
                <h2 className="panel-title">{quiz.title}</h2>
                <a
                    href={quiz.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel-source-link"
                >
                    {quiz.url.replace('https://en.wikipedia.org/wiki/', '').replace(/_/g, ' ')}
                    <span className="external-icon">↗</span>
                </a>
            </div>

            {/* Quiz Stats */}
            <div className="panel-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Questions</span>
                    <span className="stat-value">{quiz.quiz.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Easy</span>
                    <span className="stat-value">{difficulty.easy}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Medium</span>
                    <span className="stat-value">{difficulty.medium}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Hard</span>
                    <span className="stat-value">{difficulty.hard}</span>
                </div>
            </div>

            {/* Related Topics */}
            {quiz.relatedtopics && quiz.relatedtopics.length > 0 && (
                <div className="panel-section">
                    <h4 className="section-title">Related Topics</h4>
                    <div className="topics-list">
                        {quiz.relatedtopics.map((topic, index) => (
                            <span key={index} className="topic-tag">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Links */}
            {quiz.relatedlinks && quiz.relatedlinks.length > 0 && (
                <div className="panel-section">
                    <h4 className="section-title">Learn More</h4>
                    <div className="links-list">
                        {quiz.relatedlinks.map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="related-link"
                            >
                                {link.replace('https://en.wikipedia.org/wiki/', '').replace(/_/g, ' ')}
                                <span className="external-icon">↗</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Questions Review */}
            <div className="panel-section">
                <h4 className="section-title">Questions</h4>
                <div className="questions-list">
                    {quiz.quiz.map((question, index) => (
                        <QuizCard key={index} question={question} index={index} />
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="panel-actions">
                <button className="btn btn-primary">Take Quiz</button>
                <button className="btn btn-secondary" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

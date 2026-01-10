import React, { useEffect, useCallback } from 'react';
import QuizCard from './QuizCard';
import RelatedResources from './RelatedResources';

export default function QuizDetailsModal({ quiz, onClose }) {
    if (!quiz) return null;

    const countDifficulty = (questions) => {
        const counts = { easy: 0, medium: 0, hard: 0 };
        questions.forEach((q) => {
            const difficulty = q.difficulty?.toLowerCase() || 'medium';
            if (difficulty in counts) counts[difficulty]++;
        });
        return counts;
    };

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden';

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => {
            // Re-enable body scroll
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const difficulty = countDifficulty(quiz.quiz);

    return (
        <div
            className="modal-backdrop"
            onClick={handleBackdropClick}
            role="presentation"
            aria-label="Press Escape to close"
        >
            <div className="modal-content">
                {/* Close Button */}
                <button
                    className="modal-close-button"
                    onClick={onClose}
                    aria-label="Close quiz details"
                    title="Close quiz details (Esc)"
                >
                    ← Back
                </button>

                {/* Header Section */}
                <div className="modal-header">
                    <h2 className="modal-title">{quiz.title}</h2>
                    <a
                        href={quiz.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-source-link"
                    >
                        {quiz.url.replace('https://en.wikipedia.org/wiki/', '').replace(/_/g, ' ')}
                        <span className="external-icon">↗</span>
                    </a>
                </div>

                {/* Quiz Stats */}
                <div className="modal-stats">
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

                <RelatedResources
                    topics={quiz.relatedtopics}
                    links={quiz.relatedlinks}
                    className="modal-related-resources"
                />

                {/* Questions Review */}
                <div className="modal-section">
                    <h4 className="section-title">Questions</h4>
                    <div className="questions-list">
                        {quiz.quiz.map((question, index) => (
                            <QuizCard key={index} question={question} index={index} />
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                    <button className="btn btn-primary">Take Quiz</button>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

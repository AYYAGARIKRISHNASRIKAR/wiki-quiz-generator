import React from 'react';

export default function QuizCard({ question, index }) {
  const getDifficultyColor = (difficulty) => {
    const level = difficulty?.toLowerCase() || 'medium';
    switch (level) {
      case 'easy':
        return 'badge-easy';
      case 'hard':
        return 'badge-hard';
      default:
        return 'badge-medium';
    }
  };

  return (
    <div className="quiz-card">
      <div className="card-header">
        <div className="question-number-section">
          <span className="question-number">Q{index + 1}</span>
          <span className={`difficulty-badge ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty || 'Medium'}
          </span>
        </div>
      </div>

      <div className="card-content">
        <p className="question-text">{question.question}</p>

        <div className="options-review">
          {question.options.map((option, optIndex) => {
            const isCorrect = option === question.answer;
            return (
              <div
                key={optIndex}
                className={`option-review ${isCorrect ? 'correct' : ''}`}
              >
                <span className="option-content">{option}</span>
                {isCorrect && <span className="correct-icon">✓</span>}
              </div>
            );
          })}
        </div>

        <div className="answer-section">
          <p className="answer-label">Correct Answer:</p>
          <p className="answer-text">{question.answer}</p>
        </div>

        {question.explanation && (
          <div className="explanation-section">
            <p className="explanation-label">Explanation:</p>
            <p className="explanation-text">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

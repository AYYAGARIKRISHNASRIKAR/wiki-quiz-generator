import React, { useState } from 'react';
import { submitAttempt } from '../api/client';
import RelatedResources from '../components/RelatedResources';

export default function TakeQuiz({ quizId, quiz, onBack }) {
  // ✅ VALIDATE quizId ON MOUNT
  if (!quizId) {
    return (
      <div className="quiz-error-state">
        <h3>❌ Error: Quiz ID Missing</h3>
        <p>Cannot submit quiz without a valid ID. Please go back and try again.</p>
        <button className="btn btn-primary" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState(null);

  const currentQuestion = quiz[currentIndex];
  const isLastQuestion = currentIndex === quiz.length - 1;
  const isAnswered = answers[currentIndex] !== undefined;
  const allAnswered = Object.keys(answers).length === quiz.length;

  // ✅ EXTRACT LETTER FROM OPTION AND STORE IT
  const handleSelectAnswer = (option) => {
    if (submitted) return;
    const answerLetter = option.charAt(0); // e.g., "C) Vamadeva" → "C"
    setAnswers({
      ...answers,
      [currentIndex]: answerLetter,
    });
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // ✅ CALCULATE SCORE WITH CORRECTED LOGIC
  const calculateScore = () => {
    let score = 0;
    quiz.forEach((question, index) => {
      // Compare stored letter with question.answer
      if (answers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ VALIDATE quizId BEFORE SUBMISSION
      if (!quizId) {
        setError('❌ Quiz ID is missing. Cannot submit.');
        return;
      }

      // ✅ SUBMIT WITH CORRECT PAYLOAD
      const response = await submitAttempt(quizId, answers);
      setScoreData(response);
      setSubmitted(true);
    } catch (err) {
      const errorMsg = err.message || 'Failed to submit quiz. Please try again.';
      setError(errorMsg);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setScoreData(null);
    setError('');
  };

  // Results View (After Submission)
  if (submitted && scoreData) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className="quiz-results-page">
        <div className="results-header">
          <h2>Quiz Complete!</h2>
          <div className="results-score">
            <span className="score-percentage">{percentage}%</span>
            <span className="score-text">
              {score} / {quiz.length} correct
            </span>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="results-breakdown">
          {quiz.map((question, index) => {
            const userAnswer = answers[index];
            // ✅ CORRECT COMPARISON: letter to letter
            const isCorrect = userAnswer === question.answer;

            return (
              <div
                key={index}
                className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="result-question">
                  <span className="question-number">Q{index + 1}</span>
                  <p className="question-text">{question.question}</p>
                </div>

                <div className="result-details">
                  <div className="answer-row">
                    <span className="label">Your answer:</span>
                    <span className={`answer ${isCorrect ? 'correct-text' : 'incorrect-text'}`}>
                      {userAnswer}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div className="answer-row">
                      <span className="label">Correct answer:</span>
                      <span className="answer correct-text">{question.answer}</span>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="explanation">
                      <p className="explanation-label">Explanation:</p>
                      <p className="explanation-text">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ RELATED RESOURCES AFTER RESULTS */}
        {quiz[0]?.related_topics || quiz[0]?.related_links ? (
          <RelatedResources
            topics={quiz[0].related_topics}
            links={quiz[0].related_links}
            className="results-related-resources"
          />
        ) : null}

        {/* Actions */}
        <div className="results-actions">
          <button className="btn btn-primary" onClick={handleRestart}>
            Retake Quiz
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  // Quiz Taking View (Before Submission)
  return (
    <div className="quiz-taking-page">
      {/* Progress Bar */}
      <div className="quiz-progress" aria-label={`Question ${currentIndex + 1} of ${quiz.length}`}>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={quiz.length}
        >
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Question {currentIndex + 1} of {quiz.length}
        </span>
      </div>

      {/* Question Card with Difficulty Badge */}
      <div className="question-card">
        <div className="question-header">
          <h3 className="question-text">{currentQuestion.question}</h3>
          {/* ✅ DIFFICULTY BADGE */}
          {currentQuestion.difficulty && (
            <span className={`badge badge-${currentQuestion.difficulty.toLowerCase()}`}>
              {currentQuestion.difficulty}
            </span>
          )}
        </div>

        {/* Options */}
        <div className="options-list">
          {currentQuestion.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              className={`option-button ${answers[currentIndex] === option.charAt(0) ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer(option)}
              disabled={submitted}
              aria-pressed={answers[currentIndex] === option.charAt(0)}
              aria-label={`Option: ${option}${answers[currentIndex] === option.charAt(0) ? ', selected' : ''}`}
            >
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {!isLastQuestion ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!isAnswered}
          >
            Next
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Answer Status */}
      <div className="answer-status">
        <p className="status-text">
          {allAnswered
            ? '✓ All questions answered'
            : `${Object.keys(answers).length} of ${quiz.length} answered`}
        </p>
      </div>
    </div>
  );
}

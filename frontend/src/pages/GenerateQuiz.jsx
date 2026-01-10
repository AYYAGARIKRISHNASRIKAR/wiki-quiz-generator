import React, { useState } from 'react';
import { generateQuiz } from '../api/client';
import RelatedResources from '../components/RelatedResources';

export default function GenerateQuiz({ quizData, setQuizData }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('overview');

  const validateUrl = (input) => {
    try {
      const urlObj = new URL(input);
      return urlObj.hostname.includes('wikipedia.org') && urlObj.pathname.includes('/wiki/');
    } catch {
      return false;
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setMode('overview');

    if (!url.trim()) {
      setError('Please enter a Wikipedia URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Einstein)');
      return;
    }

    setLoading(true);
    try {
      const response = await generateQuiz(url);

      // ✅ VERIFY BACKEND RETURNS ID
      if (!response.id) {
        setError('⚠️ Backend error: Quiz ID missing from response');
        console.warn('Backend response missing id:', response);
        return;
      }

      // ✅ SET QUIZ DATA WITH ID
      setQuizData(response);
      setUrl('');
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const countDifficulty = (questions) => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    questions.forEach((q) => {
      const difficulty = q.difficulty?.toLowerCase() || 'medium';
      if (difficulty in counts) counts[difficulty]++;
    });
    return counts;
  };

  const handleBackToOverview = () => {
    setMode('overview');
  };

  // ✅ PASS quizData.id (NOT undefined) to TakeQuiz
  if (quizData && mode === 'take-quiz') {
    return (
      <TakeQuiz
        quizId={quizData.id}
        quiz={quizData.quiz}
        onBack={handleBackToOverview}
      />
    );
  }

  return (
    <div className="generate-quiz-page">
      <div className="input-card">
        <h2>Generate a Quiz</h2>
        <p className="input-subtitle">Enter a Wikipedia article URL to create a quiz</p>

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label htmlFor="wiki-url" className="form-label">
              Wikipedia URL
            </label>
            <input
              id="wiki-url"
              type="text"
              className="form-input"
              placeholder="https://en.wikipedia.org/wiki/Albert_Einstein"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating quiz...</p>
        </div>
      )}

      {quizData && mode === 'overview' && (
        <div className="quiz-overview-card">
          <div className="quiz-overview-header">
            <h3 className="quiz-title">{quizData.title}</h3>
            <p className="quiz-source">{quizData.url}</p>
          </div>

          <div className="quiz-stats">
            <div className="stat-item">
              <span className="stat-label">Total Questions</span>
              <span className="stat-value">{quizData.quiz.length}</span>
            </div>

            {(() => {
              const difficulty = countDifficulty(quizData.quiz);
              return (
                <>
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
                </>
              );
            })()}
          </div>

          <RelatedResources
            topics={quizData.relatedtopics}
            links={quizData.relatedlinks}
            className="overview-related-resources"
          />

          <div className="quiz-actions">
            <button
              className="btn btn-primary"
              onClick={() => setMode('take-quiz')}
            >
              Take Quiz
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setQuizData(null)}
            >
              Generate New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

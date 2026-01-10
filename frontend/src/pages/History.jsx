import React, { useState, useEffect, useRef } from 'react';
import { fetchHistory, fetchQuiz } from '../api/client';
import QuizDetailsModal from '../components/QuizDetailsModal';

export default function History() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loadingQuizId, setLoadingQuizId] = useState(null);
  const emptyStateRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (quizzes.length === 0 && !loading) {
      emptyStateRef.current?.focus();
    }
  }, [quizzes, loading]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchHistory();
      setQuizzes(data);
    } catch (err) {
      setError(err.message || 'Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (quizId) => {
    setLoadingQuizId(quizId);
    setSelectedQuiz(null);
    try {
      const quizData = await fetchQuiz(quizId);
      setSelectedQuiz(quizData);
    } catch (err) {
      setError(err.message || 'Failed to load quiz details');
    } finally {
      setLoadingQuizId(null);
    }
  };

  const truncateUrl = (url, maxLength = 60) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error && quizzes.length === 0) {
    return (
      <div className="history-page">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button className="btn btn-primary" onClick={loadHistory}>
          Retry
        </button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="history-page">
        <div className="empty-state" ref={emptyStateRef} tabIndex={-1}>
          <h3>No Quizzes Yet</h3>
          <p>Generate your first quiz to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Past Quizzes</h2>
        <p className="history-subtitle">View and retake previously generated quizzes</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Source</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="table-row">
                <td className="col-title">
                  <span className="quiz-title">{quiz.title}</span>
                </td>
                <td className="col-url">
                  <a
                    href={quiz.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quiz-url-link"
                    title={quiz.url}
                  >
                    {truncateUrl(quiz.url)}
                  </a>
                </td>
                <td className="col-action">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleViewDetails(quiz.id)}
                    disabled={loadingQuizId === quiz.id}
                  >
                    {loadingQuizId === quiz.id ? 'Loading...' : 'View Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quiz Details Modal */}
      {selectedQuiz && (
        <QuizDetailsModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      )}
    </div>
  );
}

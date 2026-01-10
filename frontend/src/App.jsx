import React, { useState } from 'react';
import GenerateQuiz from './pages/GenerateQuiz';
import History from './pages/History';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [quizData, setQuizData] = useState(null);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">📚 Wiki Quiz</h1>
          <p className="app-subtitle">Generate quizzes from Wikipedia</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs-nav" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'generate'}
          aria-controls="generate-panel"
          className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          ✨ Generate Quiz
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          aria-controls="history-panel"
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 Past Quizzes
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <div id="generate-panel" role="tabpanel" hidden={activeTab !== 'generate'}>
          <GenerateQuiz quizData={quizData} setQuizData={setQuizData} />
        </div>
        <div id="history-panel" role="tabpanel" hidden={activeTab !== 'history'}>
          <History />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 DeepKlarity | AI Wiki Quiz Generator</p>
      </footer>
    </div>
  );
}

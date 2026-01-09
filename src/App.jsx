import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import QuestionCard from './components/QuestionCard';
import ExplanationPanel from './components/ExplanationPanel';
import ChatWindow from './components/ChatWindow';
import ProgressBar from './components/ProgressBar';
import {
  selectQuestionBatch,
  updateQuestionProgress,
  calculateOverallProgress
} from './utils/learningAlgorithm';
import {
  loadProgress,
  saveProgress,
  loadCurrentBatch,
  saveCurrentBatch,
  clearCurrentBatch
} from './utils/storage';
import { isApiKeyConfigured } from './services/openai';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progressData, setProgressData] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKeyWarning, setApiKeyWarning] = useState(false);
  const [batchComplete, setBatchComplete] = useState(false);

  // Load questions and progress on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load questions
        const response = await fetch('/iot_quiz.json');
        const data = await response.json();
        setQuestions(data);

        // Load progress
        const savedProgress = loadProgress();
        setProgressData(savedProgress);

        // Check for existing batch or create new one
        const savedBatch = loadCurrentBatch();
        if (savedBatch && savedBatch.length > 0) {
          setCurrentBatch(savedBatch);
          setCurrentQuestionIndex(0);
        } else {
          // Select initial batch
          const batch = selectQuestionBatch(data, savedProgress, 10);
          setCurrentBatch(batch);
          saveCurrentBatch(batch);
        }

        // Check API key
        if (!isApiKeyConfigured()) {
          setApiKeyWarning(true);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitAnswer = (selectedAnswers, isCorrect) => {
    const question = currentBatch[currentQuestionIndex];
    setCurrentAnswers(selectedAnswers);

    // Update progress
    const newProgress = updateQuestionProgress(
      question.id,
      isCorrect,
      progressData
    );
    setProgressData(newProgress);
    saveProgress(newProgress);

    // Show explanation
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setShowChat(false);
    setCurrentAnswers([]);

    if (currentQuestionIndex < currentBatch.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Batch complete
      setBatchComplete(true);
    }
  };

  const handleStartNewBatch = () => {
    // Select new batch based on updated progress
    const newBatch = selectQuestionBatch(questions, progressData, 10);
    setCurrentBatch(newBatch);
    saveCurrentBatch(newBatch);
    setCurrentQuestionIndex(0);
    setBatchComplete(false);
  };

  const handleContinueLater = () => {
    clearCurrentBatch();
    setBatchComplete(false);
    setCurrentBatch([]);
  };

  if (loading) {
    return (
      <div className="app-container loading">
        <div className="spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (apiKeyWarning) {
    return (
      <div className="app-container">
        <div className="warning-panel">
          <h2>⚠️ API Key Required</h2>
          <p>
            To use the AI explanations and chat features, you need to configure your OpenAI API key.
          </p>
          <ol>
            <li>Open the <code>.env</code> file in the project root</li>
            <li>Add your OpenAI API key: <code>VITE_OPENAI_API_KEY=your_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
          <button className="btn btn-primary" onClick={() => setApiKeyWarning(false)}>
            I'll configure it later, continue anyway
          </button>
        </div>
      </div>
    );
  }

  if (currentBatch.length === 0) {
    return (
      <div className="app-container">
        <div className="welcome-screen">
          <h1>IoT Quiz - Adaptive Learning</h1>
          <p>
            Welcome to the intelligent IoT quiz application! This app uses spaced repetition
            and adaptive learning to help you master IoT concepts.
          </p>
          <ProgressBar progress={calculateOverallProgress(progressData, questions.length)} />
          <button className="btn btn-primary btn-large" onClick={handleStartNewBatch}>
            Start Learning Session
          </button>
        </div>
      </div>
    );
  }

  if (batchComplete) {
    const progress = calculateOverallProgress(progressData, questions.length);

    return (
      <div className="app-container">
        <div className="batch-complete-screen">
          <div className="completion-badge">🎉</div>
          <h1>Batch Complete!</h1>
          <p>Great work! You've completed this learning session.</p>

          <ProgressBar progress={progress} />

          <div className="completion-actions">
            <button className="btn btn-primary btn-large" onClick={handleStartNewBatch}>
              Start Next Batch
            </button>
            <button className="btn btn-secondary" onClick={handleContinueLater}>
              Continue Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentBatch[currentQuestionIndex];
  const progress = calculateOverallProgress(progressData, questions.length);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>IoT Quiz</h1>
        <div className="header-stats">
          <span className="stat-badge">
            Batch: {currentQuestionIndex + 1}/{currentBatch.length}
          </span>
          <span className="stat-badge">
            Overall: {progress.questionsMastered}/{progress.totalQuestions} mastered
          </span>
        </div>
      </header>

      <main className="app-main">
        <ProgressBar progress={progress} />

        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentBatch.length}
            onSubmit={handleSubmitAnswer}
            onNext={handleNextQuestion}
          />
        </AnimatePresence>

        {showExplanation && (
          <div className="explanation-and-chat">
            <ExplanationPanel
              question={currentQuestion}
              userAnswers={currentAnswers}
              onClose={() => setShowExplanation(false)}
            />

            <button
              className="btn btn-secondary chat-toggle"
              onClick={() => setShowChat(true)}
            >
              💬 Ask Questions
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showChat && (
          <ChatWindow
            question={currentQuestion}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

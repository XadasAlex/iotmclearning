import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateExplanation } from '../services/openai';
import { saveExplanation, getExplanation } from '../utils/storage';

const ExplanationPanel = ({ question, userAnswers, onClose }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        // Determine if the answer is correct
        const sortedUserAnswers = [...userAnswers].sort((a, b) => a - b);
        const sortedCorrectAnswers = [...question.correct_indices].sort((a, b) => a - b);
        const isCorrect = JSON.stringify(sortedUserAnswers) === JSON.stringify(sortedCorrectAnswers);

        // Check if we have a cached explanation for this correctness state
        const cachedExplanation = getExplanation(question.id, isCorrect);
        if (cachedExplanation) {
          setExplanation(cachedExplanation);
          setLoading(false);
          return;
        }

        // Generate new explanation
        setLoading(true);
        const result = await generateExplanation(
          question,
          userAnswers,
          question.correct_indices
        );

        setExplanation(result);
        saveExplanation(question.id, result, isCorrect);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching explanation:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [question.id, userAnswers]);

  return (
    <motion.div
      className="explanation-panel"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="explanation-header">
        <h3>📖 Explanation</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="explanation-content">
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Generating explanation...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <p className="error-hint">
              Make sure your OpenAI API key is configured in the .env file.
            </p>
          </div>
        )}

        {explanation && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="explanation-text"
          >
            <div className={`result-badge ${explanation.isCorrect ? 'correct' : 'incorrect'}`}>
              {explanation.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
            <div className="explanation-body markdown-content">
              <ReactMarkdown>{explanation.explanation}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ExplanationPanel;

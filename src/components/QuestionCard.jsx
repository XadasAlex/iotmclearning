import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionCard = ({ question, questionNumber, totalQuestions, onSubmit, onNext }) => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const toggleAnswer = (index) => {
    if (isSubmitted) return;

    if (question.multiple_choice) {
      setSelectedAnswers(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedAnswers([index]);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;

    const sortedSelected = [...selectedAnswers].sort((a, b) => a - b);
    const sortedCorrect = [...question.correct_indices].sort((a, b) => a - b);
    const correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);

    setIsCorrect(correct);
    setIsSubmitted(true);
    onSubmit(selectedAnswers, correct);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setIsSubmitted(false);
    setIsCorrect(false);
    onNext();
  };

  const getOptionClass = (index) => {
    if (!isSubmitted) {
      return selectedAnswers.includes(index) ? 'selected' : '';
    }

    const isSelected = selectedAnswers.includes(index);
    const isCorrectAnswer = question.correct_indices.includes(index);

    if (isCorrectAnswer) return 'correct';
    if (isSelected && !isCorrectAnswer) return 'incorrect';
    return '';
  };

  return (
    <motion.div
      className="question-card"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="question-header">
        <span className="question-number">
          Question {questionNumber} of {totalQuestions}
        </span>
        {question.multiple_choice && (
          <span className="multiple-choice-badge">Multiple Choice</span>
        )}
      </div>

      <h2 className="question-text">{question.question}</h2>

      <div className="options-container">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            className={`option ${getOptionClass(index)}`}
            onClick={() => toggleAnswer(index)}
            disabled={isSubmitted}
            whileHover={!isSubmitted ? { scale: 1.02 } : {}}
            whileTap={!isSubmitted ? { scale: 0.98 } : {}}
          >
            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
            {isSubmitted && question.correct_indices.includes(index) && (
              <motion.span
                className="check-mark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                ✓
              </motion.span>
            )}
            {isSubmitted && selectedAnswers.includes(index) && !question.correct_indices.includes(index) && (
              <motion.span
                className="x-mark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                ✗
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted && (
          <motion.div
            className={`result-banner ${isCorrect ? 'correct' : 'incorrect'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="result-icon">{isCorrect ? '🎉' : '📚'}</span>
            <span className="result-text">
              {isCorrect ? 'Correct! Great job!' : 'Not quite right. Let\'s learn from this!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="question-actions">
        {!isSubmitted ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0}
          >
            Submit Answer
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            Continue
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionCard;

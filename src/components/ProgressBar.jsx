import { motion } from 'framer-motion';

const ProgressBar = ({ progress }) => {
  const {
    percentComplete,
    averageMastery,
    questionsAttempted,
    questionsMastered,
    totalQuestions
  } = progress;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>Your Learning Progress</h2>
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-value">{percentComplete}%</span>
            <span className="stat-label">Complete</span>
          </div>
          <div className="stat">
            <span className="stat-value">{averageMastery}%</span>
            <span className="stat-label">Avg Mastery</span>
          </div>
          <div className="stat">
            <span className="stat-value">{questionsMastered}/{totalQuestions}</span>
            <span className="stat-label">Mastered</span>
          </div>
        </div>
      </div>

      <div className="progress-bars">
        <div className="progress-bar-item">
          <div className="progress-bar-label">
            <span>Overall Progress</span>
            <span>{questionsMastered} of {totalQuestions} mastered</span>
          </div>
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="progress-bar-item">
          <div className="progress-bar-label">
            <span>Average Mastery</span>
            <span>{questionsAttempted} questions attempted</span>
          </div>
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill mastery"
              initial={{ width: 0 }}
              animate={{ width: `${averageMastery}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

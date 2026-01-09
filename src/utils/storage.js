/**
 * LocalStorage utility for persisting user progress and explanations
 */

const STORAGE_KEYS = {
  PROGRESS: 'iot_quiz_progress',
  EXPLANATIONS: 'iot_quiz_explanations',
  CURRENT_BATCH: 'iot_quiz_current_batch'
};

// Progress data structure:
// {
//   [questionId]: {
//     timesSeen: number,
//     timesCorrect: number,
//     timesIncorrect: number,
//     lastSeen: ISO date string,
//     lastCorrect: ISO date string,
//     consecutiveIncorrect: number
//   }
// }

export const loadProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading progress:', error);
    return {};
  }
};

export const saveProgress = (progressData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// Explanations cache structure:
// {
//   [questionId]: {
//     correct: {
//       explanation: string,
//       isCorrect: true,
//       generatedAt: ISO date string
//     },
//     incorrect: {
//       explanation: string,
//       isCorrect: false,
//       generatedAt: ISO date string
//     }
//   }
// }

export const loadExplanations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPLANATIONS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading explanations:', error);
    return {};
  }
};

export const saveExplanation = (questionId, explanation, isCorrect) => {
  try {
    const explanations = loadExplanations();

    // Initialize question object if it doesn't exist
    if (!explanations[questionId]) {
      explanations[questionId] = {};
    }

    // Store explanation under 'correct' or 'incorrect' key
    const key = isCorrect ? 'correct' : 'incorrect';
    explanations[questionId][key] = {
      ...explanation,
      generatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.EXPLANATIONS, JSON.stringify(explanations));
  } catch (error) {
    console.error('Error saving explanation:', error);
  }
};

export const getExplanation = (questionId, isCorrect) => {
  try {
    const explanations = loadExplanations();
    const key = isCorrect ? 'correct' : 'incorrect';
    return explanations[questionId]?.[key] || null;
  } catch (error) {
    console.error('Error getting explanation:', error);
    return null;
  }
};

export const loadCurrentBatch = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_BATCH);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading current batch:', error);
    return null;
  }
};

export const saveCurrentBatch = (batch) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BATCH, JSON.stringify(batch));
  } catch (error) {
    console.error('Error saving current batch:', error);
  }
};

export const clearCurrentBatch = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_BATCH);
  } catch (error) {
    console.error('Error clearing current batch:', error);
  }
};

// Export all data for backup
export const exportAllData = () => {
  return {
    progress: loadProgress(),
    explanations: loadExplanations(),
    exportedAt: new Date().toISOString()
  };
};

// Import data from backup
export const importAllData = (data) => {
  try {
    if (data.progress) saveProgress(data.progress);
    if (data.explanations) {
      localStorage.setItem(STORAGE_KEYS.EXPLANATIONS, JSON.stringify(data.explanations));
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.EXPLANATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_BATCH);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

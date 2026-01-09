/**
 * Smart Learning Algorithm with Spaced Repetition
 * Tracks user progress and prioritizes questions they struggle with
 */

// Calculate mastery level for a question (0-100%)
export const calculateMastery = (stats) => {
  if (!stats || stats.timesSeen === 0) return 0;

  const correctRate = stats.timesCorrect / stats.timesSeen;
  const attempts = Math.min(stats.timesSeen, 10); // Cap at 10 for diminishing returns

  // Mastery = (correct rate * 70%) + (attempts factor * 30%)
  const attemptsBonus = (attempts / 10) * 30;
  const correctScore = correctRate * 70;

  return Math.min(100, correctScore + attemptsBonus);
};

// Calculate priority score for question selection (higher = more important to show)
export const calculatePriority = (stats, lastSeenDate) => {
  if (!stats) return 100; // New questions have high priority

  const mastery = calculateMastery(stats);
  const daysSinceLastSeen = lastSeenDate
    ? (Date.now() - new Date(lastSeenDate).getTime()) / (1000 * 60 * 60 * 24)
    : 30; // If never seen, treat as 30 days ago

  // Questions with low mastery and haven't been seen recently get highest priority
  const masteryFactor = (100 - mastery) / 100; // Lower mastery = higher factor
  const timeFactor = Math.min(daysSinceLastSeen / 7, 1); // Normalize to 1 week
  const recencyBonus = stats.lastCorrect ? 0 : 0.5; // Boost if never answered correctly

  // Recent mistakes get extra priority
  const recentMistakePenalty = stats.consecutiveIncorrect * 10;

  return (masteryFactor * 60) + (timeFactor * 30) + (recencyBonus * 10) + recentMistakePenalty;
};

// Select a batch of questions using smart algorithm
export const selectQuestionBatch = (allQuestions, progressData, batchSize = 10) => {
  // Calculate priority for each question
  const questionsWithPriority = allQuestions.map(question => {
    const stats = progressData[question.id];
    const priority = calculatePriority(stats, stats?.lastSeen);

    return {
      ...question,
      priority,
      mastery: calculateMastery(stats)
    };
  });

  // Sort by priority (highest first)
  questionsWithPriority.sort((a, b) => b.priority - a.priority);

  // Select batch with weighted randomness to avoid predictability
  const batch = [];
  const highPriority = questionsWithPriority.slice(0, Math.ceil(batchSize * 1.5));

  // Take top 70% from high priority, 30% random from the rest
  const guaranteedCount = Math.ceil(batchSize * 0.7);
  const randomCount = batchSize - guaranteedCount;

  // Add guaranteed high-priority questions
  batch.push(...highPriority.slice(0, guaranteedCount));

  // Add some random ones for variety
  const remaining = highPriority.slice(guaranteedCount);
  for (let i = 0; i < randomCount && remaining.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    batch.push(remaining.splice(randomIndex, 1)[0]);
  }

  return batch.slice(0, batchSize);
};

// Update progress after answering a question
export const updateQuestionProgress = (questionId, isCorrect, currentProgress) => {
  const stats = currentProgress[questionId] || {
    timesSeen: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
    lastSeen: null,
    lastCorrect: null,
    consecutiveIncorrect: 0
  };

  const newStats = {
    ...stats,
    timesSeen: stats.timesSeen + 1,
    lastSeen: new Date().toISOString()
  };

  if (isCorrect) {
    newStats.timesCorrect = stats.timesCorrect + 1;
    newStats.lastCorrect = new Date().toISOString();
    newStats.consecutiveIncorrect = 0;
  } else {
    newStats.timesIncorrect = stats.timesIncorrect + 1;
    newStats.consecutiveIncorrect = (stats.consecutiveIncorrect || 0) + 1;
  }

  return {
    ...currentProgress,
    [questionId]: newStats
  };
};

// Calculate overall learning progress
export const calculateOverallProgress = (progressData, totalQuestions) => {
  const questionIds = Object.keys(progressData);

  if (questionIds.length === 0) {
    return {
      percentComplete: 0,
      averageMastery: 0,
      questionsAttempted: 0,
      questionsMastered: 0,
      totalQuestions
    };
  }

  let totalMastery = 0;
  let masteredCount = 0;

  questionIds.forEach(id => {
    const mastery = calculateMastery(progressData[id]);
    totalMastery += mastery;
    if (mastery >= 80) masteredCount++;
  });

  const averageMastery = totalMastery / questionIds.length;
  const percentComplete = (masteredCount / totalQuestions) * 100;

  return {
    percentComplete: Math.round(percentComplete),
    averageMastery: Math.round(averageMastery),
    questionsAttempted: questionIds.length,
    questionsMastered: masteredCount,
    totalQuestions
  };
};

// Get questions that need review (low mastery or not seen recently)
export const getQuestionsNeedingReview = (allQuestions, progressData, limit = 5) => {
  return allQuestions
    .filter(q => {
      const stats = progressData[q.id];
      if (!stats) return true; // Never seen

      const mastery = calculateMastery(stats);
      const daysSinceLastSeen = (Date.now() - new Date(stats.lastSeen).getTime()) / (1000 * 60 * 60 * 24);

      return mastery < 70 || daysSinceLastSeen > 7;
    })
    .slice(0, limit);
};

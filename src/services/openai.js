import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openaiClient = null;

const getClient = () => {
  if (!openaiClient && apiKey) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });
  }
  return openaiClient;
};

/**
 * Generate explanation for a question answer
 */
export const generateExplanation = async (question, userAnswers, correctAnswers) => {
  const client = getClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const userAnswerIndices = userAnswers.sort((a, b) => a - b);
  const correctAnswerIndices = correctAnswers.sort((a, b) => a - b);
  const isCorrect = JSON.stringify(userAnswerIndices) === JSON.stringify(correctAnswerIndices);

  const userSelectedOptions = userAnswerIndices.map(i => `${String.fromCharCode(65 + i)}. ${question.options[i]}`).join('\n');
  const correctOptions = correctAnswerIndices.map(i => `${String.fromCharCode(65 + i)}. ${question.options[i]}`).join('\n');

  const allOptions = question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');

  const prompt = `You are an IoT (Internet of Things) expert educator. A student just answered a multiple-choice question.

Question: ${question.question}

Options:
${allOptions}

Correct Answer(s):
${correctOptions}

Student's Answer(s):
${userSelectedOptions}

The student's answer was ${isCorrect ? 'CORRECT' : 'INCORRECT'}.

Please provide:
1. A brief explanation of why the correct answer(s) are correct (2-3 sentences)
2. Key concepts the student should understand (bullet points)
3. ${!isCorrect ? 'Why the student\'s selected answer(s) were incorrect and what misconceptions they might have' : 'Reinforcement of why their understanding is correct'}

Keep it concise, educational, and encouraging. Focus on helping them learn the underlying concepts.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Good balance of quality and cost
      messages: [
        {
          role: 'system',
          content: 'You are an expert IoT educator who explains concepts clearly and concisely. You help students understand not just the correct answer, but the underlying principles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      explanation: response.choices[0].message.content,
      isCorrect,
      userAnswers: userAnswerIndices,
      correctAnswers: correctAnswerIndices
    };
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Failed to generate explanation. Please check your API key and try again.');
  }
};

/**
 * Chat with AI about a specific question
 */
export const chatAboutQuestion = async (question, conversationHistory, userMessage) => {
  const client = getClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const allOptions = question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
  const correctOptions = question.correct_indices.map(i => `${String.fromCharCode(65 + i)}. ${question.options[i]}`).join('\n');

  const systemMessage = {
    role: 'system',
    content: `You are an IoT expert helping a student understand this question:

Question: ${question.question}

Options:
${allOptions}

Correct Answer(s):
${correctOptions}

Help the student understand the concepts, answer their questions, and provide additional context about IoT technologies. Be concise but thorough.`
  };

  const messages = [
    systemMessage,
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 400
    });

    return {
      role: 'assistant',
      content: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to get response. Please try again.');
  }
};

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = () => {
  return !!apiKey && apiKey.length > 0;
};

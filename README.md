# IoT Quiz - Adaptive Learning Application

A modern, intelligent quiz application built with React and Framer Motion that uses adaptive learning algorithms to help you master IoT concepts effectively.

## 🌟 Features

### Smart Learning Algorithm
- **Spaced Repetition**: Questions you struggle with appear more frequently
- **Mastery Tracking**: Monitor your progress on each question (0-100% mastery)
- **Priority-Based Selection**: Algorithm prioritizes questions based on performance

### AI-Powered Explanations
- Powered by OpenAI GPT-4o-mini
- Detailed explanations for correct and incorrect answers
- Cached explanations to save API calls

### Interactive Chat
- Ask follow-up questions about any quiz question
- Real-time AI responses

### Progress Tracking
- Visual progress indicators
- Track questions mastered
- Historical performance data

## 🚀 Quick Start

### 1. Configure OpenAI API Key

Open `.env` file and add your API key:
```
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

### 2. Start the Application

```bash
npm run dev
```

### 3. Open Browser

Navigate to `http://localhost:5173`

## 📖 How to Use

1. **Start Learning Session**: Begin with a batch of 10 questions
2. **Answer Questions**: Select answers and submit
3. **Review Explanations**: Read AI-generated feedback
4. **Ask Questions**: Use chat for deeper understanding
5. **Track Progress**: Monitor your mastery levels

## 🧠 Learning Algorithm

The app uses a sophisticated algorithm that:
- Calculates mastery (0-100%) based on performance
- Prioritizes low-mastery questions
- Uses spaced repetition for effective learning
- Adapts to your learning patterns

## 💾 Data Storage

All progress is stored locally in your browser's LocalStorage:
- Progress tracking
- Explanation cache
- Current session state

## 🎨 Tech Stack

- React 18 + Vite
- Framer Motion
- OpenAI API (GPT-4o-mini)
- LocalStorage

## 📝 Project Structure

```
iot-quiz-app/
├── src/
│   ├── components/      # React components
│   ├── services/        # OpenAI integration
│   ├── utils/           # Learning algorithm & storage
│   └── App.jsx          # Main app
└── public/
    └── iot_quiz.json    # Quiz questions
```

## 💡 Tips

- Regular short sessions are more effective
- Always read the explanations
- Use the chat feature to ask questions
- Track your progress to identify weak areas

## 🔐 Security Note

For production, move API calls to a backend server. Never expose API keys in client code.

## 🐛 Troubleshooting

- **API Key issues**: Restart dev server after changing `.env`
- **Progress not saving**: Check LocalStorage isn't disabled
- **Slow loading**: First explanations require API calls, then cached

Happy Learning! 🚀
# iotmclearning
# iotmclearning
# iotmclearning

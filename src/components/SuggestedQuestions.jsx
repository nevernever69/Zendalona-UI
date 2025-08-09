import React from 'react';

const SuggestedQuestions = ({ onQuestionSelect }) => {
  const questions = [
    'What is Zendalona?',
    'What are Zendalona products?',
    'What does Zendalona do?',
    'How can I contact Zendalona support?',
  ];

  return (
    <div className="mt-6" aria-label="Suggested Questions">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Suggested Questions</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list">
        {questions.map((question, index) => (
          <li key={index} className="flex">
            <button
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-700 transition-colors"
              onClick={() => onQuestionSelect(question)}
              aria-label={`Select suggested question: ${question}`}
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedQuestions;
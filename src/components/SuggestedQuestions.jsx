import React from 'react';

const SuggestedQuestions = ({ onQuestionSelect }) => {
  const questions = [
    'What is Zendalona?',
    'What are Zendalona products?',
    'What does Zendalona do?',
    'How can I contact Zendalona support?',
  ];

  return (
    <div className="suggested-questions" aria-label="Suggested Questions">
      <h3 className="suggested-questions-header">Suggested Questions</h3>
      <ul className="suggested-questions-list">
        {questions.map((question, index) => (
          <li key={index} className="suggested-question-item">
            <button
              className="suggested-question-button"
              onClick={() => onQuestionSelect(question)}
              aria-label={`Select question: ${question}`}
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

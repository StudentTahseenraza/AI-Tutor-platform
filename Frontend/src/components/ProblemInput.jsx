import React from 'react';
import PropTypes from 'prop-types';

const ProblemInput = ({ problem, setProblem, onSubmit, isLoading }) => {
  const handleChange = (e) => setProblem(e.target.value);

  const handleAnalyze = () => onSubmit();

  const handleVoiceInput = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setProblem('Voice recognition not supported in this browser. Please use text input.');
      return;
    }
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => setProblem(event.results[0][0].transcript);
    recognition.onerror = (event) => setProblem(`Voice error: ${event.error}. Please try again.`);
    recognition.start();
  };

  return (
    <div className="problem-input">
      <textarea
        value={problem}
        onChange={handleChange}
        placeholder="Enter problem description..."
        className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        disabled={isLoading}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleAnalyze}
          className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-400 dark:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Problem'}
        </button>
        <button
          onClick={handleVoiceInput}
          className="px-4 py-2 text-white bg-green-500 rounded"
        >
          🎙️ Voice Input
        </button>
      </div>
    </div>
  );
};

ProblemInput.propTypes = {
  problem: PropTypes.string.isRequired,
  setProblem: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default ProblemInput;
import React from 'react';
import PropTypes from 'prop-types';

const OutputDisplay = ({ output }) => {
  const handleVoiceOutput = () => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(output || 'No output available.');
    utterance.lang = 'en-US';
    utterance.onend = () => console.log('Speech synthesis completed.');
    utterance.onerror = (event) => console.warn('Speech synthesis error:', event.error);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="output-section">
      <pre className="p-2 rounded">{output || 'No output yet...'}</pre>
      <button
        onClick={handleVoiceOutput}
        className="px-4 py-2 mt-2 text-white bg-purple-500 rounded"
      >
        🔊 Hear Output
      </button>
    </div>
  );
};

OutputDisplay.propTypes = { output: PropTypes.string };

export default OutputDisplay;
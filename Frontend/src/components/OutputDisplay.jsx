import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy } from 'lucide-react';

const OutputDisplay = ({ output }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative p-4 bg-white rounded-lg shadow-md dark:bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">📤 Output</h2>
        <button
          onClick={handleCopy}
          className="flex items-center px-3 py-1 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          <Copy size={16} className="mr-1" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <pre className="p-3 overflow-auto text-sm text-gray-800 whitespace-pre-wrap bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-100 max-h-60">
        {output ? output : 'No output yet.'}
      </pre>
    </div>
  );
};

OutputDisplay.propTypes = {
  output: PropTypes.string.isRequired
};

export default OutputDisplay;

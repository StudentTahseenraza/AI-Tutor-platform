import React from 'react';
import PropTypes from 'prop-types';

const formatPseudoCode = (code) => {
  if (!code) return '';

  return code
    .split('\n')
    .map((line, index) => {
      let html = line
        .replace(/\b(FUNCTION|IF|THEN|ELSE IF|ELSE|WHILE|FOR|CREATE)\b/g, '<span class="text-blue-500 font-bold">$1</span>')
        .replace(/\b(RETURN|SET|APPEND|BREAK|CONTINUE)\b/g, '<span class="text-green-500 font-bold">$1</span>')
        .replace(/\b(END IF|END WHILE|END FUNCTION|END FOR|END ELSE)\b/g, '<span class="text-red-500 font-bold">$1</span>')
        .replace(/\b(NULL|NOT NULL|IS NOT NULL|IS NULL)\b/g, '<span class="text-yellow-500 font-bold">$1</span>')
        .replace(/\/\/(.*)/g, '<span class="text-gray-500 italic">// $1</span>');

      // Preserve indentation
      const leadingSpaces = line.match(/^\s*/)?.[0] || '';
      const spacer = '&nbsp;'.repeat(leadingSpaces.length);

      return `<div key=${index} class="pseudo-line font-mono">${spacer}${html.trim()}</div>`;
    })
    .join('');
};

const PseudoCode = ({ code }) => {
  return (
    <div className="p-5 mt-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
      <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">📄 Pseudocode</h2>
      <div
        className="p-4 font-mono text-sm leading-relaxed prose whitespace-pre-wrap bg-gray-100 rounded dark:prose-invert max-w-none dark:bg-gray-800"
        dangerouslySetInnerHTML={{ __html: formatPseudoCode(code) }}
      />
    </div>
  );
};

PseudoCode.propTypes = {
  code: PropTypes.string
};

export default PseudoCode;

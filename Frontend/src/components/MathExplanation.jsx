import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MathExplanation = ({ explanation }) => {
  // Split explanation into lines and process for inline/block math
  const renderContent = () => {
    if (!explanation) {
      return <p>Submit a problem to see the mathematical explanation.</p>;
    }

    const lines = explanation.split('\n');
    return lines.map((line, index) => {
      // Handle block math (e.g., \[ a_i + a_j = T \])
      if (line.match(/\\\[.*?\\\]/)) {
        const mathContent = line.match(/\\\[([\s\S]*?)\\\]/)?.[1] || '';
        return <BlockMath key={index} math={mathContent} />;
      }
      // Handle inline math (e.g., \( a_i \))
      const parts = line.split(/(\\\([^\\]*?\\\))/g);
      return (
        <p key={index}>
          {parts.map((part, i) => {
            if (part.match(/\\\(.*?\\\)/)) {
              const mathContent = part.match(/\\\(([\s\S]*?)\\\)/)?.[1] || '';
              return <InlineMath key={i} math={mathContent} />;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="explanation-section">
      <h2 className="mb-4 text-xl font-semibold">Mathematical Explanation</h2>
      {renderContent()}
    </div>
  );
};

export default MathExplanation;
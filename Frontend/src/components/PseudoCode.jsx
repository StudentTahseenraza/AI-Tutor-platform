import React from 'react';

const PseudoCode = ({ code }) => {
  return (
    <div className="pseudo-code-section">
      <h2 className="mb-4 text-xl font-semibold">Pseudo Code</h2>
      <pre>{code || 'Submit a problem to see the pseudo code.'}</pre>
    </div>
  );
};

export default PseudoCode;
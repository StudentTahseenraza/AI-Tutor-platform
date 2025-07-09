import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Tutorial = ({ steps, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= (steps.length || 0)) onComplete();
  }, [step, steps, onComplete]);

  const nextStep = () => setStep(prev => prev + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg glass-effect">
        <h2 className="mb-4 text-2xl font-semibold">Tutorial: {steps[0]?.problem || 'Problem'}</h2>
        {steps.length > 0 ? (
          <>
            <p className="mb-4">Step {step + 1} of {steps.length}: {steps[step].text}</p>
            {steps[step].code && (
              <pre className="p-2 mb-4 bg-gray-100 rounded dark:bg-gray-800">{steps[step].code}</pre>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-400"
              disabled={step >= steps.length - 1}
            >
              Next
            </button>
            {step === steps.length - 1 && (
              <button onClick={onComplete} className="px-4 py-2 ml-2 text-white bg-green-500 rounded">
                Finish
              </button>
            )}
          </>
        ) : (
          <p className="mb-4">Generating tutorial... Please wait or enter a problem.</p>
        )}
      </div>
    </div>
  );
};

Tutorial.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    code: PropTypes.string,
    problem: PropTypes.string,
  })),
  onComplete: PropTypes.func.isRequired,
};

export default Tutorial;
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

const CodeEditor = ({ problem, code, setCode, onExecute, isExecuting, suggestions, setSuggestions, theme }) => {
  const [testCases, setTestCases] = useState('');
  const [language, setLanguage] = useState('python');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (code.trim()) {
        try {
          const newSuggestions = await suggestCode(code);
          setSuggestions(newSuggestions);
        } catch (err) {
          console.warn('Failed to fetch suggestions:', err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [code, setSuggestions]);

  const handleEditorChange = (value) => setCode(value || '');

  const handleExecuteClick = () => onExecute(language, code, testCases);

  return (
    <div className="editor-section">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="p-2 mb-2 border rounded dark:bg-gray-800 dark:text-white"
      >
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
      </select>
      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={{ minimap: { enabled: false } }}
      />
      <textarea
        value={testCases}
        onChange={(e) => setTestCases(e.target.value)}
        placeholder="Enter test cases (e.g., nums = [2, 7, 11, 15], target = 9)"
        className="mt-2 test-cases-input"
      />
      <button
        onClick={handleExecuteClick}
        className="px-4 py-2 mt-2 text-white bg-green-500 rounded disabled:bg-gray-400"
        disabled={isExecuting}
      >
        {isExecuting ? 'Running...' : 'Run Code'}
      </button>
      {suggestions.length > 0 && (
        <div className="p-2 mt-2 bg-yellow-100 rounded dark:bg-yellow-900">
          <h3 className="font-semibold">Suggestions:</h3>
          <ul className="list-disc list-inside">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

CodeEditor.propTypes = {
  problem: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
  onExecute: PropTypes.func.isRequired,
  isExecuting: PropTypes.bool.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSuggestions: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired, // Added prop validation
};

export default CodeEditor;
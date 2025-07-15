import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';
import { suggestCode } from '../utils/api';
import { Copy } from 'lucide-react';

const CodeEditor = ({
  problem,
  code,
  setCode,
  onExecute,
  isExecuting,
  suggestions,
  setSuggestions,
  theme
}) => {
  const [testCases, setTestCases] = useState('');
  const [language, setLanguage] = useState('python');
  const [copied, setCopied] = useState(false);

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

  const handleExecuteClick = () => {
    if (language !== 'python') {
      alert('Currently only Python code execution is supported.');
      return;
    }
    onExecute(language, code, testCases);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">🧪 Code Editor</h2>
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-1 px-3 text-sm border rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="python">Python</option>
            <option value="javascript" disabled>JavaScript (soon)</option>
          </select>
          <button
            onClick={handleCopyCode}
            className="flex items-center px-3 py-1 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
          >
            <Copy size={16} className="mr-1" />
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
        }}
      />
      <textarea
        value={testCases}
        onChange={(e) => setTestCases(e.target.value)}
        placeholder="Enter test inputs (optional, passed as stdin)"
        className="w-full p-2 mt-2 text-sm border rounded dark:bg-gray-800 dark:text-white"
        rows={3}
      />
      <button
        onClick={handleExecuteClick}
        disabled={isExecuting}
        className="px-5 py-2 mt-3 text-white transition bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {isExecuting ? 'Running...' : 'Run Code'}
      </button>

      {suggestions.length > 0 && (
        <div className="p-3 mt-4 text-sm bg-yellow-100 rounded dark:bg-yellow-900 dark:text-yellow-200">
          <h3 className="mb-1 font-semibold">💡 AI Suggestions:</h3>
          <ul className="pl-4 list-disc list-inside">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
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
  theme: PropTypes.string.isRequired,
};

export default CodeEditor;

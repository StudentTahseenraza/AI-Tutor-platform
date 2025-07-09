import React, { useState, useCallback, useEffect } from 'react';
import ProblemInput from '../components/ProblemInput';
import MathExplanation from '../components/MathExplanation';
import PseudoCode from '../components/PseudoCode';
import OutputDisplay from '../components/OutputDisplay';
import CodeEditor from '../components/CodeEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import Tutorial from '../components/Tutorial';
import Leaderboard from '../components/Leaderboard';
import { analyzeProblem, suggestCode, generateTutorial } from '../utils/api';
import axios from 'axios';

const Home = () => {
  const [problem, setProblem] = useState('');
  const [mathExplanation, setMathExplanation] = useState('');
  const [pseudoCode, setPseudoCode] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showTutorial, setShowTutorial] = useState(false);
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('points')) || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [tutorialSteps, setTutorialSteps] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    localStorage.setItem('points', points);
    fetchLeaderboard();
  }, [theme, points]);

  const getCachedResponse = (problem) => {
    const cached = localStorage.getItem(`problem_${problem}`);
    return cached ? JSON.parse(cached) : null;
  };

  const setCachedResponse = (problem, response) => {
    try {
      localStorage.setItem(`problem_${problem}`, JSON.stringify(response));
    } catch (e) {
      console.warn('Failed to cache response:', e);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSubmit = useCallback(
    debounce(async () => {
      if (!problem.trim()) {
        setError('Please enter a problem to analyze.');
        return;
      }
      const cachedResponse = getCachedResponse(problem);
      if (cachedResponse) {
        setMathExplanation(cachedResponse.mathExplanation);
        setPseudoCode(cachedResponse.pseudoCode);
        setOutput('Loaded from cache.');
        setError('');
        try {
          const tutorial = await generateTutorial(problem);
          setTutorialSteps(tutorial.steps);
        } catch (err) {
          console.warn('Failed to generate tutorial:', err);
        }
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await analyzeProblem(problem);
        setMathExplanation(response.mathExplanation);
        setPseudoCode(response.pseudoCode);
        setOutput('Analysis complete.');
        setCachedResponse(problem, response);
        setPoints(prev => prev + 5);
        const tutorial = await generateTutorial(problem);
        setTutorialSteps(tutorial.steps);
      } catch (err) {
        setError(err.message || 'An error occurred.');
        setMathExplanation('');
        setPseudoCode('');
        setOutput('');
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    [problem]
  );

  const handleExecute = async (language, code, testCases) => {
    if (!code.trim()) {
      setError('Please enter code to execute.');
      return;
    }
    setIsExecuting(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/execute', {
        language,
        source: code,
        stdin: testCases || ''
      });
      setOutput(response.data.output || response.data.error || 'No output.');
      if (response.data.output) setPoints(prev => prev + 10);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute code.');
      setOutput('');
    } finally {
      setIsExecuting(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/leaderboard');
      setLeaderboard(response.data);
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
      setLeaderboard([{ name: 'user', score: points }]);
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const clearError = () => setError('');
  const handleTutorialComplete = () => setShowTutorial(false);

  return (
    <div className="min-h-screen text-gray-900 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <header className="fixed z-50 w-full">
        <div className="container p-4 mx-auto">
          <div className="flex items-center justify-between p-4 rounded-lg shadow-lg glass-effect">
            <div className="flex items-center">
              <img src="/src/assets/logo.webp" alt="CodeFlow Tutor Logo" className="mr-4 logo" />
              <h1 className="text-3xl font-bold">CodeFlow Tutor</h1>
            </div>
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={toggleTheme}
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </header>
      <div className="pt-24">
        <ErrorBoundary>
          <div className="container p-6 mx-auto space-y-12">
            <section className="p-6 text-center rounded-lg shadow-lg glass-effect">
              <h2 className="mb-4 text-4xl font-bold">Welcome to CodeFlow Tutor</h2>
              <p className="mb-6 text-lg">Accelerate your coding journey with AI-powered tools!</p>
              <button onClick={() => setShowTutorial(true)} className="px-4 py-2 text-white bg-blue-500 rounded">Start Tutorial</button>
            </section>
            <section className="p-6 rounded-lg shadow-lg glass-effect">
              <h2 className="mb-4 text-2xl font-semibold">Leaderboard</h2>
              <Leaderboard points={points} leaderboard={leaderboard} />
            </section>
            <div className="space-y-6">
              <div className="p-6 rounded-lg shadow-lg glass-effect">
                <ProblemInput problem={problem} setProblem={setProblem} onSubmit={handleSubmit} isLoading={isLoading} />
                {error && (
                  <div className="flex items-center justify-between p-4 mt-4 bg-red-100 rounded dark:bg-red-900">
                    <span>{error}</span>
                    <button className="text-sm underline" onClick={clearError}>Dismiss</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="p-6 rounded-lg shadow-lg glass-effect">
                  <MathExplanation explanation={mathExplanation} />
                </div>
                <div className="p-6 rounded-lg shadow-lg glass-effect">
                  <PseudoCode code={pseudoCode} />
                </div>
              </div>
              <div className="p-6 rounded-lg shadow-lg glass-effect">
                <CodeEditor
                  problem={problem}
                  code={code}
                  setCode={setCode}
                  onExecute={handleExecute}
                  isExecuting={isExecuting}
                  suggestions={suggestions}
                  setSuggestions={setSuggestions}
                  theme={theme} // Pass theme prop
                />
              </div>
              <div className="p-6 rounded-lg shadow-lg glass-effect">
                <OutputDisplay output={output} />
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
      {showTutorial && <Tutorial steps={tutorialSteps} onComplete={handleTutorialComplete} />}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
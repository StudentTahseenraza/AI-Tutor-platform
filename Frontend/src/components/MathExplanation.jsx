import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { askExplanationFollowup, summarizeExplanation } from '../utils/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import botAvatar from '../assets/bot.avif'; // 🧠 Add your bot icon (replace with actual path)

const formatLine = (line) => {
  const keywords = ['Time Complexity', 'Space Complexity', 'target', 'pivot', 'binary search', 'sorted', 'rotated'];
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    line = line.replace(regex, '<strong>$1</strong>');
  });
  return line.replace(/`([^`]+)`/g, '<code>$1</code>');
};

const formatChatContent = (text) => {
  const blocks = text.split(/```(?:python)?\n([\s\S]*?)```/g);
  return blocks.map((block, i) => {
    if (i % 2 === 1) {
      // It's a code block
      return (
        <SyntaxHighlighter
          key={i}
          language="python"
          style={oneDark}
          className="overflow-x-auto text-sm rounded-lg"
        >
          {block.trim()}
        </SyntaxHighlighter>
      );
    } else {
      // It's regular text
      const withFormatting = block
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/(?:^|\n)\d+\.\s(.+?)(?=\n|$)/g, '<ol><li>$1</li></ol>')
        .replace(/(?:^|\n)[\*\-+]\s(.+?)(?=\n|$)/g, '<ul><li>$1</li></ul>')
        .replace(/\n{2,}/g, '</p><p>');
      return (
        <div
          key={i}
          className="my-2 prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: `<p>${withFormatting}</p>` }}
        />
      );
    }
  });
};

const MathExplanation = ({ explanation }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const renderContent = () => {
    if (!explanation) {
      return <p className="text-gray-600 dark:text-gray-400">Submit a problem to see the explanation.</p>;
    }

    const lines = explanation.split('\n');
    return lines.map((line, index) => {
      if (line.match(/\\\[.*?\\\]/)) {
        const mathContent = line.match(/\\\[([\s\S]*?)\\\]/)?.[1] || '';
        return <BlockMath key={index} math={mathContent} />;
      }

      const parts = line.split(/(\\\([^\\]*?\\\))/g);
      return (
        <p
          key={index}
          className="my-2 leading-relaxed text-gray-800 dark:text-gray-100"
          dangerouslySetInnerHTML={{
            __html: parts
              .map(part => {
                if (part.match(/\\\(.*?\\\)/)) {
                  const mathContent = part.match(/\\\(([\s\S]*?)\\\)/)?.[1] || '';
                  return `<span class="katex-math">\\(${mathContent}\\)</span>`;
                }
                return formatLine(part);
              })
              .join('')
          }}
        />
      );
    });
  };

  const handleAskAI = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    try {
      const res = await askExplanationFollowup(explanation, chatInput);
      setChatResponse(res.response || 'No answer received.');
    } catch (err) {
      setChatResponse('Error: Unable to fetch explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setLoadingSummary(true);
    try {
      const res = await summarizeExplanation(explanation);
      setSummary(res.response || 'No summary generated.');
    } catch (err) {
      setSummary('Error: Could not summarize.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-lg dark:bg-gray-900">
      <h2 className="mb-4 text-2xl font-semibold text-blue-600 dark:text-blue-300">🧠 Mathematical Explanation</h2>
      <div className="space-y-2 text-base prose prose-blue max-w-none dark:prose-invert">{renderContent()}</div>

      {/* 🔍 Ask AI Section */}
      <div className="pt-4 mt-6 border-t">
        <h3 className="mb-2 text-lg font-medium">💬 Ask AI for Clarification</h3>
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Ask something about the explanation..."
            className="p-2 border rounded dark:bg-gray-800 dark:text-white"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button
            onClick={handleAskAI}
            disabled={loading}
            className="self-start px-4 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {loading ? 'Asking...' : 'Ask AI'}
          </button>

          {/* ✅ AI Response with Avatar */}
          {chatResponse && (
            <div className="flex items-start mt-4 space-x-3">
              <img src={botAvatar} alt="Bot" className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="max-w-3xl px-4 py-3 text-sm text-gray-800 bg-gray-100 rounded-lg shadow dark:bg-gray-800 dark:text-gray-100">
                {formatChatContent(chatResponse)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📝 Summary Section */}
      <div className="pt-4 mt-6 border-t">
        <h3 className="mb-2 text-lg font-medium">📝 Want a Quick Summary?</h3>
        <button
          onClick={handleSummarize}
          disabled={loadingSummary}
          className="px-4 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
        >
          {loadingSummary ? 'Summarizing...' : 'Summarize Explanation'}
        </button>
        {summary && (
          <div className="flex items-start mt-4 space-x-3">
            <img src={botAvatar} alt="Bot" className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="max-w-3xl px-4 py-3 text-sm text-gray-800 rounded-lg shadow bg-purple-50 dark:bg-gray-800 dark:text-gray-100">
              {formatChatContent(summary)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathExplanation;

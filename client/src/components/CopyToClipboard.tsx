import React, { useState, useEffect } from 'react';
import { Question } from '../models/Question';

interface CopyToClipboardProps {
  question: (Question & { id: string });
}

const defaultTemplate = `
שאלת היום:
{title}
קושי:
{difficulty}
קישור:
https://leetcode.com/problems/{titleSlug}
קישור לדרייב:
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


הרבה בהצלחה:

`;

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ question }) => {
  const [message, setMessage] = useState(defaultTemplate);
  const [isCopied, setIsCopied] = useState(false);

  // Function to replace placeholders
  const generateMessage = (template: string) => {
    return template
      .replace('{title}', question.title)
      .replace('{difficulty}', question.difficulty)
      .replace('{titleSlug}', question.titleSlug);
  };

  // Reset message when question changes
  useEffect(() => {
    setMessage(defaultTemplate);
    setIsCopied(false);
  }, [question]);


  const handleCopy = () => {
    const finalMessage = generateMessage(message);
    navigator.clipboard.writeText(finalMessage).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-3 text-left">
        Copy Shareable Message
      </h3>
      <p className="text-sm text-gray-500 mb-3 text-left">
        Edit the template below. Placeholders:
        <code>{'{title}'}</code> - the question title 
        <code>{'{difficulty}'}</code> - the question difficulty
        <code>{'{titleSlug}'}</code> - the question title slug     
        
        will be replaced automatically.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-48 p-3 border border-gray-300 rounded-md text-sm font-mono bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={8}
        dir="auto"
      />
      <button
        onClick={handleCopy}
        className={`w-full mt-3 px-4 py-2.5 rounded-md font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isCopied
            ? 'bg-green-600 text-white focus:ring-green-500'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
          }`}
      >
        {isCopied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  );
};

export default CopyToClipboard; 
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
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-md font-semibold text-gray-700 mb-2">Copy Shareable Message</h4>
      <p className="text-sm text-gray-500 mb-3">
        You can edit the message template below. Use placeholders like <code>{'{title}'}</code>, <code>{'{difficulty}'}</code>, and <code>{'{titleSlug}'}</code>.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={5}
      />
      <button
        onClick={handleCopy}
        className={`w-full mt-3 px-4 py-2 rounded-md font-medium text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isCopied
            ? 'bg-green-600 text-white focus:ring-green-500'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
      >
        {isCopied ? 'Copied to Clipboard!' : 'Copy Message'}
      </button>
    </div>
  );
};

export default CopyToClipboard; 
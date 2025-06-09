import React from 'react';
import { Question } from '../models/Question';
import CopyToClipboard from './CopyToClipboard';

interface QuestionCardProps {
  question: Question & { id: string };
  questionSent: boolean;
  onToggleSentStatus: () => void;
  onGetAnother: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  questionSent, 
  onToggleSentStatus,
  onGetAnother 
}) => {
  const { difficulty, frontendQuestionId, title, titleSlug, topicTags } = question;
  
  // Get color scheme based on difficulty
  const getColors = () => {
    switch (difficulty) {
      case 'Easy':
        return { 
          bg: 'bg-green-500', 
          text: 'text-green-700', 
          hoverBg: 'hover:bg-green-700',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-700'
        };
      case 'Medium':
        return { 
          bg: 'bg-yellow-500', 
          text: 'text-yellow-700', 
          hoverBg: 'hover:bg-yellow-700',
          badgeBg: 'bg-yellow-100',
          badgeText: 'text-yellow-700'
        };
      case 'Hard':
        return { 
          bg: 'bg-red-500', 
          text: 'text-red-700', 
          hoverBg: 'hover:bg-red-700',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700'
        };
      default:
        return { 
          bg: 'bg-blue-500', 
          text: 'text-blue-700', 
          hoverBg: 'hover:bg-blue-700',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700'
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className={`${colors.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
          {difficulty}
        </div>
        <div className="text-sm text-gray-500 font-medium">Question #{frontendQuestionId}</div>
        <div className="ml-auto">
          {questionSent ? (
            <div className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full text-xs">
              ✓ Sent
            </div>
          ) : (
            <div className="bg-yellow-100 text-yellow-700 font-medium px-3 py-1 rounded-full text-xs">
              Not sent
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="mb-5">
        <a
          href={`https://leetcode.com/problems/${titleSlug}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium underline text-sm inline-block"
        >
          Open in LeetCode
        </a>
      </div>
      
      {topicTags && topicTags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Topics:</p>
          <div className="flex flex-wrap gap-2">
            {topicTags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onToggleSentStatus}
          className={questionSent 
            ? "bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-200 transition font-medium text-sm"
            : "bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm"
          }
          data-sent-status={questionSent ? 'sent' : 'unsent'}
        >
          {questionSent ? "Mark as Not Sent" : "Mark as Sent"}
        </button>
        
        <button
          onClick={onGetAnother}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition text-sm font-medium"
        >
          Get Another Question
        </button>
      </div>

      <CopyToClipboard question={question} />
    </div>
  );
};

export default QuestionCard; 
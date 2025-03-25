import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';
import { importQuestionsFromJSON } from './utils/importQuestions';
import { getRandomUnsentQuestionByDifficulty, markQuestionAsSent } from './services/questionService';
import { Question } from './models/Question';
import './App.css';

function App() {
  // Database status
  const [isDbEmpty, setIsDbEmpty] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Import functionality
  const [isImporting, setIsImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importDone, setImportDone] = useState(false);

  // Question retrieval
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [randomQuestion, setRandomQuestion] = useState<(Question & { id: string }) | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievalError, setRetrievalError] = useState<string | null>(null);
  const [questionSent, setQuestionSent] = useState(false);

  // Check if database has questions on component mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'questions'));
        setIsDbEmpty(snapshot.size === 0);
      } catch (err) {
        console.error('Error checking database:', err);
        setDbError('Could not connect to Firebase. Check your configuration.');
      } finally {
        setIsLoading(false);
      }
    };

    checkDatabase();
  }, []);

  const handleImport = async () => {
    setIsImporting(true);
    setImportError(null);
    
    try {
      const count = await importQuestionsFromJSON('/free_leetcode_questions.json');
      setImportCount(count);
      setImportDone(true);
      setIsDbEmpty(false);
    } catch (err) {
      console.error('Import error:', err);
      setImportError('Error importing questions. Check the console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleGetRandomQuestion = async () => {
    setIsRetrieving(true);
    setRetrievalError(null);
    setQuestionSent(false);
    
    try {
      const question = await getRandomUnsentQuestionByDifficulty(selectedDifficulty);
      setRandomQuestion(question);
      if (!question) {
        setRetrievalError(`No more unsent ${selectedDifficulty} questions available!`);
      }
    } catch (err) {
      console.error('Error retrieving question:', err);
      setRetrievalError('Error retrieving random question. Check the console for details.');
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleMarkAsSent = async () => {
    if (!randomQuestion) return;

    try {
      await markQuestionAsSent(randomQuestion);
      setQuestionSent(true);
    } catch (err) {
      console.error('Error marking as sent:', err);
      setRetrievalError('Error marking question as sent. Check the console for details.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-6">Connecting to Firebase...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Database connection error
  if (dbError) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <div className="bg-red-100 p-4 rounded text-red-800 border border-red-400">
          <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
          <p>{dbError}</p>
          <p className="mt-4">Check your Firebase configuration in the environment variables.</p>
        </div>
      </div>
    );
  }

  // Import view (shown only if database is empty)
  if (isDbEmpty === true) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">LeetCode Question Retriever</h1>
        
        <div className="bg-yellow-100 p-4 rounded mb-6 text-yellow-800 border border-yellow-400">
          <p className="font-bold text-lg mb-2">Database Setup Required</p>
          <p>Your database is empty. You need to import LeetCode questions before you can use the application.</p>
        </div>
        
        {!importDone ? (
          <div>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="bg-blue-600 text-white px-6 py-3 rounded font-semibold mb-4 disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : 'Import LeetCode Questions'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will import free LeetCode questions from a JSON file. This operation is only needed once.
            </p>
          </div>
        ) : (
          <div className="bg-green-100 p-4 rounded mb-6 text-green-800 border border-green-400">
            <p className="font-medium">Import Complete!</p>
            <p>Successfully imported {importCount} questions to Firestore.</p>
            <p className="mt-2">Refresh the page to start using the application.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        )}
        
        {importError && (
          <div className="bg-red-100 p-4 rounded text-red-800 border border-red-400 mt-4">
            {importError}
          </div>
        )}
      </div>
    );
  }

  // Main application view
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">LeetCode Question Retriever</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Get Random Question</h2>
        <div className="flex space-x-2 mb-4">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
            className="border rounded px-3 py-2"
            disabled={isRetrieving}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <button
            onClick={handleGetRandomQuestion}
            disabled={isRetrieving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isRetrieving ? 'Retrieving...' : 'Get Random Question'}
          </button>
        </div>
      </div>
      
      {retrievalError && (
        <div className="bg-red-100 p-4 rounded text-red-800 border border-red-400 mb-6">
          {retrievalError}
        </div>
      )}
      
      {randomQuestion && (
        <div className="bg-white p-6 rounded shadow-md border border-gray-200 mb-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">
              {randomQuestion.frontendQuestionId}. {randomQuestion.title}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              randomQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              randomQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {randomQuestion.difficulty}
            </span>
          </div>
          
          <a 
            href={`https://leetcode.com/problems/${randomQuestion.titleSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline block mb-4"
          >
            Open in LeetCode
          </a>
          
          {randomQuestion.topicTags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Topics:</p>
              <div className="flex flex-wrap gap-1">
                {randomQuestion.topicTags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {!questionSent ? (
            <button
              onClick={handleMarkAsSent}
              className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            >
              Mark as Sent
            </button>
          ) : (
            <div className="mt-2 text-green-700 font-medium">
              ✓ Question marked as sent
            </div>
          )}
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded text-gray-700 text-sm">
        <p>This application helps you retrieve random LeetCode questions by difficulty level.</p>
        <p className="mt-2">Mark questions as sent after you've shared them with your group.</p>
      </div>
    </div>
  );
}

export default App;

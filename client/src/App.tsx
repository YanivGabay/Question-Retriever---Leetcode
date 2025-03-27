import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { importQuestionsFromJSON } from './utils/importQuestions';
import { 
  getRandomUnsentQuestionByDifficulty, 
  getAllQuestions,
  markQuestionAsSent
} from './services/questionService';
import { Question } from './models/Question';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import StatsPanel from './components/StatsPanel';
import QuestionSelector from './components/QuestionSelector';
import QuestionCard from './components/QuestionCard';
import ImportPanel from './components/ImportPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SentQuestionsList from './components/SentQuestionsList';

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

  // Stats
  const [stats, setStats] = useState<{
    total: number;
    easy: number;
    medium: number;
    hard: number;
    sent: number;
  }>({ 
    total: 0, 
    easy: 0, 
    medium: 0, 
    hard: 0,
    sent: 0 
  });

  const [showSentQuestions, setShowSentQuestions] = useState(false);

  // Check if database has questions on component mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'questions'));
        setIsDbEmpty(snapshot.size === 0);
        
        if (snapshot.size > 0) {
          fetchStats();
        }
      } catch (err) {
        console.error('Error checking database:', err);
        setDbError('Could not connect to Firebase. Check your configuration.');
      } finally {
        setIsLoading(false);
      }
    };

    checkDatabase();
  }, []);

  // Fetch question stats
  const fetchStats = async () => {
    try {
      // Get total questions
      let totalQuestions = 0;
      getAllQuestions((questions) => {
        totalQuestions = questions.length;
      });
      
      // Get questions by difficulty
      const easyQuery = query(collection(db, 'questions'), where('difficulty', '==', 'Easy'));
      const mediumQuery = query(collection(db, 'questions'), where('difficulty', '==', 'Medium'));
      const hardQuery = query(collection(db, 'questions'), where('difficulty', '==', 'Hard'));
      
      const [easySnapshot, mediumSnapshot, hardSnapshot, sentSnapshot] = await Promise.all([
        getDocs(easyQuery),
        getDocs(mediumQuery),
        getDocs(hardQuery),
        getDocs(collection(db, 'retrievedQuestions'))
      ]);
      
      setStats({
        total: totalQuestions,
        easy: easySnapshot.size,
        medium: mediumSnapshot.size,
        hard: hardSnapshot.size,
        sent: sentSnapshot.size
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportError(null);
    
    try {
      const count = await importQuestionsFromJSON('/free_leetcode_questions.json');
      setImportCount(count);
      setImportDone(true);
      setIsDbEmpty(false);
      
      // Fetch updated stats
      fetchStats();
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
    setRandomQuestion(null);
    
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

  const handleToggleSentStatus = async () => {
    if (!randomQuestion) return;
    
    try {
      const retrievedId = await markQuestionAsSent(randomQuestion);
      
      if (retrievedId) {
        setQuestionSent(true);
        
        setStats(prevStats => ({
          ...prevStats,
          sent: prevStats.sent + 1
        }));
      }
    } catch (error) {
      console.error("Error marking question as sent:", error);
    }
  };

  const handleUnsend = () => {
    setStats(prevStats => ({
      ...prevStats,
      sent: Math.max(0, prevStats.sent - 1)
    }));
  };

  // Different UI states based on application status
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Connecting to Firebase..." />;
  }

  // Database connection error
  if (dbError) {
    return <ErrorMessage message={dbError} title="Connection Error" fullScreen={true} />;
  }

  // Import view (shown only if database is empty)
  if (isDbEmpty === true) {
    return (
      <ImportPanel
        isImporting={isImporting}
        importCount={importCount}
        importError={importError}
        importDone={importDone}
        onImport={handleImport}
      />
    );
  }

  // Main application view
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <Header subtitle="Find and track random LeetCode questions by difficulty" />
        
        <StatsPanel stats={stats} />
        
        <QuestionSelector
          selectedDifficulty={selectedDifficulty}
          isRetrieving={isRetrieving}
          onSelectDifficulty={setSelectedDifficulty}
          onGetQuestion={handleGetRandomQuestion}
        />
      
        {retrievalError && (
          <ErrorMessage message={retrievalError} />
        )}
      
        {randomQuestion && (
          <QuestionCard
            question={randomQuestion}
            questionSent={questionSent}
            onToggleSentStatus={handleToggleSentStatus}
            onGetAnother={handleGetRandomQuestion}
          />
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowSentQuestions(!showSentQuestions)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showSentQuestions ? 'Hide Sent Questions' : 'Show Sent Questions'}
          </button>
        </div>

        <SentQuestionsList 
          isVisible={showSentQuestions} 
          onUnsend={handleUnsend}
        />
        
        <Footer />
      </div>
    </div>
  );
}

export default App;

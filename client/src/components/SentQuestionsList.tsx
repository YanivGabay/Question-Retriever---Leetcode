import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { unsendQuestion } from '../services/questionService';

interface SentQuestion {
  id: string;
  questionId: string;
  title: string;
  difficulty: string;
  sentDate: string;
}

interface SentQuestionsListProps {
  isVisible: boolean;
  onUnsend?: () => void;
}

const SentQuestionsList = ({ isVisible, onUnsend }: SentQuestionsListProps) => {
  const [sentQuestions, setSentQuestions] = useState<SentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unsendingId, setUnsendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const q = query(collection(db, 'retrievedQuestions'), orderBy('sentDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          questionId: data.questionId,
          title: data.title,
          difficulty: data.difficulty,
          sentDate: data.sentDate
        };
      });
      
      setSentQuestions(questions);
      setIsLoading(false);
    }, (error) => {
      console.error('Error in snapshot listener:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isVisible]);

  const handleUnsend = async (sentQuestionId: string, questionId: string) => {
    try {
      setUnsendingId(sentQuestionId);
      
      // Use the unsendQuestion service which properly handles the unsend operation
      const success = await unsendQuestion(questionId);
      
      if (success && onUnsend) {
        onUnsend();
      }
    } catch (error) {
      console.error('Error unsending question:', error);
    } finally {
      setUnsendingId(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-black">Recently Sent Questions</h3>
      {isLoading ? (
        <p className="text-black">Loading sent questions...</p>
      ) : sentQuestions.length === 0 ? (
        <p className="text-black">No questions have been sent yet.</p>
      ) : (
        <div className="space-y-2">
          {sentQuestions.map((question) => (
            <div 
              key={question.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              <div className="flex items-center">
                <span className="font-medium text-black">{question.title}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-black">
                  {new Date(question.sentDate).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleUnsend(question.id, question.questionId)}
                  disabled={unsendingId === question.id}
                  className={`px-3 py-1 text-sm rounded ${
                    unsendingId === question.id
                      ? 'bg-gray-300 cursor-not-allowed text-black'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {unsendingId === question.id ? 'Unsending...' : 'Unsend'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentQuestionsList; 
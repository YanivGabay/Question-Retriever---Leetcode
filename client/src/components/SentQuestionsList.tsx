import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

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

  const handleUnsend = async (questionId: string) => {
    try {
      setUnsendingId(questionId);
      await deleteDoc(doc(db, 'retrievedQuestions', questionId));
      if (onUnsend) onUnsend();
    } catch (error) {
      console.error('Error unsending question:', error);
    } finally {
      setUnsendingId(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Recently Sent Questions</h3>
      {isLoading ? (
        <p className="text-gray-500">Loading sent questions...</p>
      ) : sentQuestions.length === 0 ? (
        <p className="text-gray-500">No questions have been sent yet.</p>
      ) : (
        <div className="space-y-2">
          {sentQuestions.map((question) => (
            <div 
              key={question.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              <div className="flex items-center">
                <span className="font-medium">{question.title}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {new Date(question.sentDate).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleUnsend(question.id)}
                  disabled={unsendingId === question.id}
                  className={`px-3 py-1 text-sm rounded ${
                    unsendingId === question.id
                      ? 'bg-gray-300 cursor-not-allowed'
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
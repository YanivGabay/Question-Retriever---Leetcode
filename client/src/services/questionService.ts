import { 
  collection, 
  doc, 
 
  getDocs, 
  addDoc, 
  query, 
  where,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question, TopicTag } from '../models/Question';
import { createRetrievedQuestion } from '../models/RetrievedQuestion';

// Collection references
const questionsCol = collection(db, 'questions');
const retrievedQuestionsCol = collection(db, 'retrievedQuestions');

/**
 * Convert Firestore document to Question
 */
const convertDocToQuestion = (doc: QueryDocumentSnapshot<DocumentData>): Question & { id: string } => {
  const data = doc.data() as Question;
  return {
    ...data,
    id: doc.id
  };
};

/**
 * Get all questions with real-time updates
 */
export const getAllQuestions = (callback: (questions: Array<Question & { id: string }>) => void) => {
  return onSnapshot(questionsCol, (snapshot) => {
    const questions = snapshot.docs.map(convertDocToQuestion);
    callback(questions);
  });
};

/**
 * Get filtered questions by difficulty with real-time updates
 */
export const getQuestionsByDifficulty = (difficulty: string, callback: (questions: Array<Question & { id: string }>) => void) => {
  const q = query(questionsCol, where('difficulty', '==', difficulty));
  return onSnapshot(q, (snapshot) => {
    const questions = snapshot.docs.map(convertDocToQuestion);
    callback(questions);
  });
};

/**
 * Get questions by topic tag with real-time updates
 */
export const getQuestionsByTopicTag = (tagName: string, callback: (questions: Array<Question & { id: string }>) => void) => {
  const q = query(questionsCol);
  return onSnapshot(q, (snapshot) => {
    const questions = snapshot.docs
      .map(convertDocToQuestion)
      .filter((question: Question & { id: string }) => 
        question.topicTags.some((tag: TopicTag) => tag.name.toLowerCase() === tagName.toLowerCase())
      );
    callback(questions);
  });
};

/**
 * Get a question by ID with real-time updates
 */
export const getQuestionById = (id: string, callback: (question: (Question & { id: string }) | null) => void) => {
  const docRef = doc(questionsCol, id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        ...docSnap.data() as Question,
        id: docSnap.id
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Get a random question by difficulty that hasn't been sent yet
 */
export const getRandomUnsentQuestionByDifficulty = async (difficulty: string): Promise<(Question & { id: string }) | null> => {
  try {
    // Step 1: Get all questions of the specified difficulty
    const difficultyQuery = query(questionsCol, where('difficulty', '==', difficulty));
    const questionsByDifficultySnapshot = await getDocs(difficultyQuery);
    const questionsByDifficulty = questionsByDifficultySnapshot.docs.map(convertDocToQuestion);
    
    if (questionsByDifficulty.length === 0) {
      console.log(`No questions found with difficulty: ${difficulty}`);
      return null;
    }
    
    // Step 2: Get all retrieved question IDs (questions already sent)
    const retrievedSnapshot = await getDocs(retrievedQuestionsCol);
    const sentQuestionIds = retrievedSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data().questionId);
    
    // Step 3: Filter out questions that have already been sent
    const availableQuestions = questionsByDifficulty.filter(
      (question: Question & { id: string }) => !sentQuestionIds.includes(question.id)
    );
    
    if (availableQuestions.length === 0) {
      console.log(`All ${difficulty} questions have already been sent!`);
      return null;
    }
    
    // Step 4: Select a random question from the available ones
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  } catch (error) {
    console.error("Error getting random question:", error);
    return null;
  }
};

/**
 * Record that a question was sent to the WhatsApp group
 */
export const markQuestionAsSent = async (question: Question & { id: string }): Promise<string | null> => {
  try {
    // Create a record in retrievedQuestions collection using the helper function
    const retrievedQuestion = createRetrievedQuestion(question);
    const retrievedDoc = await addDoc(retrievedQuestionsCol, retrievedQuestion);
    
    console.log(`Question "${question.title}" marked as sent with ID: ${retrievedDoc.id}`);
    return retrievedDoc.id;
  } catch (error) {
    console.error("Error marking question as sent:", error);
    return null;
  }
}; 
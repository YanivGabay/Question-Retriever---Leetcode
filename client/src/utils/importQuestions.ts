import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question, LeetCodeQuestion, convertToQuestionModel } from '../models/Question';

/**
 * One-time utility to import questions from JSON file to Firestore
 * 
 * IMPORTANT: This should be run ONLY ONCE after setting up the application.
 * Running this multiple times may create duplicate entries if the logic changes.
 */
export const importQuestionsFromJSON = async (jsonFilePath: string): Promise<number> => {
  try {
    console.log(`Starting import from ${jsonFilePath}...`);
    
    // Check if we already have questions in the database
    const existingCheck = await getDocs(collection(db, 'questions'));
    if (existingCheck.size > 0) {
      console.warn(`Database already contains ${existingCheck.size} questions. Be cautious about importing again.`);
      
      // Optional: Uncomment this to prevent accidental re-imports
      // if (!window.confirm(`Database already contains ${existingCheck.size} questions. Are you SURE you want to continue importing?`)) {
      //   return 0;
      // }
    }
    
    // Import the JSON file
    const response = await fetch(jsonFilePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON data: ${response.statusText}`);
    }
    
    const leetcodeQuestions: LeetCodeQuestion[] = await response.json();
    console.log(`Loaded ${leetcodeQuestions.length} questions from JSON`);
    
    // Filter out paid questions
    const freeQuestions = leetcodeQuestions.filter(q => !q.paidOnly);
    console.log(`Found ${freeQuestions.length} free questions to import`);
    
    // Convert to our model
    const questions = freeQuestions.map(convertToQuestionModel);
    
    return await importBatchToFirestore(questions);
  } catch (error) {
    console.error('Error importing questions:', error);
    return 0;
  }
};

/**
 * Batch import questions to Firestore
 * Checks for duplicates based on frontendQuestionId
 */
const importBatchToFirestore = async (questions: Question[]): Promise<number> => {
  const questionsCol = collection(db, 'questions');
  let importedCount = 0;
  let duplicateCount = 0;
  
  console.log(`Starting batch import of ${questions.length} questions...`);
  
  for (const question of questions) {
    // Check if question already exists by frontendQuestionId
    const q = query(questionsCol, where('frontendQuestionId', '==', question.frontendQuestionId));
    const existingDocs = await getDocs(q);
    
    if (existingDocs.empty) {
      await addDoc(questionsCol, {
        ...question,
        importedAt: new Date().toISOString()
      });
      importedCount++;
      
      // Log progress
      if (importedCount % 100 === 0) {
        console.log(`Imported ${importedCount} questions...`);
      }
    } else {
      duplicateCount++;
    }
  }
  
  console.log(`Import complete. Total questions imported: ${importedCount}, Duplicates skipped: ${duplicateCount}`);
  return importedCount;
}; 
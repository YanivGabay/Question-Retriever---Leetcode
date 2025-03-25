import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question, LeetCodeQuestion, convertToQuestionModel } from '../models/Question';

/**
 * One-time utility to import questions from JSON file to Firestore
 * 
 * IMPORTANT: This should be run ONLY ONCE after setting up the application.
 */
export const importQuestionsFromJSON = async (jsonFilePath: string): Promise<number> => {
  try {
    console.log(`Starting import from ${jsonFilePath}...`);
    
    // Check if we already have questions in the database
    const existingCheck = await getDocs(collection(db, 'questions'));
    if (existingCheck.size > 0) {
      console.warn(`Database already contains ${existingCheck.size} questions. Skipping import.`);
      return existingCheck.size; // Return the existing count and don't import
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
    
    return await batchImportQuestions(questions);
  } catch (error) {
    console.error('Error importing questions:', error);
    throw error;
  }
};

/**
 * Efficiently import questions to Firestore using batched writes
 */
const batchImportQuestions = async (questions: Question[]): Promise<number> => {
  const questionsCol = collection(db, 'questions');
  const timestamp = new Date().toISOString();
  let totalImported = 0;
  
  console.log(`Starting batched import of ${questions.length} questions...`);
  
  try {
    // Process in batches (Firestore batch limit is 500)
    const BATCH_SIZE = 450; // Just under the 500 limit to be safe
    const batches = Math.ceil(questions.length / BATCH_SIZE);
    
    for (let i = 0; i < batches; i++) {
      const batch = writeBatch(db);
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, questions.length);
      const currentBatch = questions.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${batches} (${currentBatch.length} questions)...`);
      
      for (const question of currentBatch) {
        // Use frontendQuestionId as document ID to ensure uniqueness
        const docId = `q_${question.frontendQuestionId}`;
        const docRef = doc(questionsCol, docId);
        
        batch.set(docRef, {
          ...question,
          importedAt: timestamp
        });
      }
      
      // Commit the batch
      await batch.commit();
      totalImported += currentBatch.length;
      console.log(`Batch ${i + 1}/${batches} completed. Total progress: ${totalImported}/${questions.length}`);
    }
    
    console.log(`Import complete. ${totalImported} questions imported.`);
    return totalImported;
  } catch (error) {
    console.error('Error in batch import:', error);
    throw error;
  }
}; 
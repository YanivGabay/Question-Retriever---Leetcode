/**
 * Topic Tag interface
 */
export interface TopicTag {
  name: string;
  id?: string;
  slug?: string;
}

/**
 * Question interface - represents a LeetCode question
 */
export interface Question {
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frontendQuestionId: string;
  topicTags: TopicTag[];
  importedAt?: string;
}

/**
 * LeetCode Question from API
 */
export interface LeetCodeQuestion {
  title: string;
  titleSlug: string;
  difficulty: string;
  frontendQuestionId: string;
  topicTags: TopicTag[];
  paidOnly?: boolean;
  hasSolution?: boolean;
  hasVideoSolution?: boolean;
}

/**
 * Convert LeetCode API question to our Firestore structure
 */
export const convertToQuestionModel = (leetcodeQuestion: LeetCodeQuestion): Question => {
  return {
    title: leetcodeQuestion.title,
    titleSlug: leetcodeQuestion.titleSlug,
    difficulty: leetcodeQuestion.difficulty as 'Easy' | 'Medium' | 'Hard',
    frontendQuestionId: leetcodeQuestion.frontendQuestionId,
    topicTags: leetcodeQuestion.topicTags.map(tag => ({ name: tag.name })),
    importedAt: new Date().toISOString()
  };
};

/**
 * Default empty question for form initialization
 */
export const emptyQuestion: Question = {
  title: "",
  titleSlug: "",
  difficulty: "Easy",
  frontendQuestionId: "",
  topicTags: []
}; 
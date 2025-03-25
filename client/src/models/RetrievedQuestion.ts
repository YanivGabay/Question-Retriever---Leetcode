import { Question, TopicTag } from './Question';

/**
 * RetrievedQuestion interface - represents a question that was sent to WhatsApp
 */
export interface RetrievedQuestion {
  id?: string;
  questionId: string;
  frontendQuestionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags: TopicTag[];
  sentDate: string;
  isChosen: boolean;
}

/**
 * Creates a RetrievedQuestion object from a Question
 */
export const createRetrievedQuestion = (question: Question & { id: string }): RetrievedQuestion => {
  return {
    questionId: question.id,
    frontendQuestionId: question.frontendQuestionId,
    title: question.title,
    titleSlug: question.titleSlug,
    difficulty: question.difficulty,
    topicTags: question.topicTags,
    sentDate: new Date().toISOString(),
    isChosen: true
  };
}; 
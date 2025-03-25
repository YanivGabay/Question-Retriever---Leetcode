import requests
import json
import time

API_URL = 'https://leetcode.com/graphql'

query = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      difficulty
      frontendQuestionId: questionFrontendId
      paidOnly: isPaidOnly
      title
      titleSlug
      topicTags {
        name
        id
        slug
      }
      hasSolution
      hasVideoSolution
    }
  }
}
"""

def fetch_all_free_questions(batch_size=50):
    all_free_questions = []
    total_questions = None
    current_skip = 0

    while True:
        variables = {
            "categorySlug": "",
            "limit": batch_size,
            "skip": current_skip,
            "filters": {}
        }

        response = requests.post(API_URL, json={'query': query, 'variables': variables})
        response.raise_for_status()
        data = response.json()

        question_list = data["data"]["problemsetQuestionList"]["questions"]
        total_questions = data["data"]["problemsetQuestionList"]["total"]

        # Filter out paid-only questions
        free_questions_batch = [q for q in question_list if not q["paidOnly"]]
        all_free_questions.extend(free_questions_batch)

        print(f"Batch fetched: {len(question_list)} questions (Free: {len(free_questions_batch)}) at skip={current_skip}")

        current_skip += batch_size

        # Break loop when all questions have been fetched
        if current_skip >= total_questions:
            break

        # Avoid rate limiting
        time.sleep(1)

    return all_free_questions

if __name__ == "__main__":
    questions = fetch_all_free_questions()

    with open("free_leetcode_questions.json", "w", encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=4)

    print(f"Total free questions saved: {len(questions)}")

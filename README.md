# Question-Retriever---Leetcode
A tool to fetch LeetCode questions for our WhatsApp community - "Help Me LeetCode"

## Project Overview

This project consists of two main parts:
1. **Python Script**: For fetching all free LeetCode questions from the API
2. **React Client**: Web application for retrieving random questions by difficulty and tracking which ones have been sent to the WhatsApp group

## Python Script Setup

### Prerequisites
- Python 3.6 or higher

### Setting up the Virtual Environment
1. Create and activate the virtual environment:
   
   **Windows:**
   ```
   python -m venv venv
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```
   python -m venv venv
   source venv/bin/activate
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

### Usage
Run the script to fetch all free LeetCode questions:
```
python all-questions-fetch-script.py
```

This will generate a `free_leetcode_questions.json` file containing information about all the free questions available on LeetCode.

## React Client Application

The client application helps you retrieve random LeetCode questions by difficulty level and track which questions have been sent to the WhatsApp group.

### Features
- Select questions by difficulty (Easy, Medium, Hard)
- Get random unsent questions
- View question details including topics and direct links
- Mark questions as sent to the WhatsApp group

### Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Firebase configuration in `.env` file

4. Import questions to Firebase (ONE-TIME OPERATION):
   ```
   npm run import
   ```
   ⚠️ **IMPORTANT**: The import process should only be run ONCE after setting up your Firebase project. Running it multiple times may create duplicate entries.

5. Start the development server:
   ```
   npm start
   ```

For detailed instructions, see the [Client README](client/README.md).

## Workflow

1. Run the Python script to fetch all free LeetCode questions
2. Copy the generated JSON file to the client/public directory
3. Use the React client to import questions to Firebase (ONE-TIME OPERATION)
4. Use the web application to retrieve and track questions for the WhatsApp group

## Understanding the Import Process

The import process is a critical one-time step:

1. The Python script fetches all LeetCode questions and saves them to a JSON file
2. The import utility reads this JSON file and stores the questions in Firebase Firestore
3. This creates the database that the application uses to retrieve questions

After the initial import, you should never need to run the import again unless:
- You reset your Firebase database
- You want to update with new questions that have been added to LeetCode since your last import

The import tool has safeguards to prevent accidental duplicate imports, but it's best to treat it as a one-time setup operation.

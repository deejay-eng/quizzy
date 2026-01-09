# Quizzy — CausalFunnel Quiz Assignment

A simple quiz application built with Next.js (App Router) that fetches 15 questions from Open Trivia DB, runs a 30-minute timed quiz, and shows a detailed report at the end.  

## Live Demo
[Deployed URL](quizzy-git-main-djs-projects-5304a308.vercel.app)

## Features 
- Start page to collect user email and begin the quiz flow.  
- Quiz screen with:
  - 15 questions fetched from Open Trivia DB: `https://opentdb.com/api.php?amount=15`.  
  - 30-minute countdown timer visible at the top.  
  - Auto-submit when the timer reaches 0.  
  - Question navigation panel to jump to any question.  
  - Status indicators for:
    - Visited questions
    - Attempted questions  
- Report page after submit/time end:
  - Shows each question with the user's selected answer and the correct answer for easy comparison.
  - Shows score summary.  

## Data Source
- Questions are fetched from Open Trivia DB API:
  - Endpoint: `https://opentdb.com/api.php?amount=15`  
- The app uses:
  - `question` as the question text.  
  - A combined list of `correct_answer` + `incorrect_answers` as choices (shuffled).  
  - `correct_answer` as the correct answer.  

Note: Open Trivia DB returns a random set of questions per request, so the set of questions can differ from manually opening the same endpoint in a browser at a different time.  

## Tech Stack
- Next.js (React, App Router)
- Plain CSS (no UI library)
- LocalStorage for saving quiz progress during the session  

## Folder Structure
```txt
app/
  page.js            # Start page (email)
  quiz/page.js       # Quiz UI + timer + navigation
  report/page.js     # Report screen (answers vs correct)
  layout.js
  globals.css
lib/
  quiz.js            # Fetch + decode + shuffle helpers
  storage.js         # localStorage helpers
```
Setup / Installation (Run locally)

1. Install Node.js (LTS recommended)

2. Install dependencies:

```bash
npm install

```
3. Start dev server:

```bash
npm run dev

```
4. Open:

http://localhost:3000

## How to Use
Enter your email on the start page and click “Start Quiz”.  

Answer questions, use Next/Previous or jump via the overview panel.  

Submit anytime or wait for auto-submit at 0:00.  

View the report page for question-by-question comparison.  

## Assumptions
The quiz is intended for a single user/session in one browser tab (state is stored in localStorage).  

Since the assignment does not require a backend, all state is kept client-side.  

Questions vary between runs because the OpenTDB endpoint returns random questions unless a session token is used.  

## Challenges & How I solved them
HTML entities in API text: OpenTDB questions/answers sometimes include HTML entities (e.g., &quot;). I decode them before rendering for readability.  

Timer + auto-submit: Implemented a countdown based on startedAt timestamp so refreshing the page does not reset the timer. Auto-submit triggers when remaining time reaches 0.  

Navigation status (visited/attempted): Tracked visited questions and selected answers in state + localStorage to reflect accurate status indicators in the overview panel.  

## Bonus Improvements (UX)
Responsive layout for mobile/tablet/desktop using CSS grid and media queries.  

Progress indicator (answered count) and a confirmation dialog before manual submit.  


import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Replace this with your Google Sheet ID
  const SHEET_ID = '16_j_AR_CnAYDedNqX6lCTKnQ0twJXn1pOBR_3ZTgbmU';
  const SHEET_NAME = 'Material'; // Change this if your sheet name is different

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const GOOGLE_SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
      
      const response = await fetch(GOOGLE_SHEETS_URL);
      const text = await response.text();
      const data = JSON.parse(text.substr(47).slice(0, -2));
      
      const formattedQuestions = data.table.rows.slice(1).map(row => ({
        question: row.c[0].v,
        options: [row.c[1].v, row.c[2].v, row.c[3].v, row.c[4].v],
        correctAnswer: row.c[5].v
      }));

      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: selectedOption
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let newScore = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentQuestion(0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading Quiz Questions...</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="container results-container">
        <h2>Quiz Results</h2>
        <div className="score">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p>You got {score} out of {questions.length} questions correct</p>
        <button className="button" onClick={resetQuiz}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="quiz-container">
        <div className="progress-bar">
          <div 
            className="progress"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="quiz-header">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
        </div>

        <div className="question">
          <h2>{questions[currentQuestion]?.question}</h2>
        </div>

        <div className="options">
          {questions[currentQuestion]?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`option-button ${userAnswers[currentQuestion] === option ? 'selected' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="navigation">
          <button
            className="button"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              className="button finish"
              onClick={calculateScore}
              disabled={!userAnswers[currentQuestion]}
            >
              Finish Quiz
            </button>
          ) : (
            <button
              className="button"
              onClick={nextQuestion}
              disabled={!userAnswers[currentQuestion]}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
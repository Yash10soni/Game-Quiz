import React, { useState, useEffect } from "react";
import axios from "axios";
import "./quiz.css";

const Quiz = () => {
  // State declarations
  const [quizData, setQuizData] = useState(null); // Initially null until data is fetched
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quiz data and leaderboard data when component mounts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:5000/api/quiz"),
      axios.get("http://localhost:5000/api/leaderboard")
    ])
      .then(([quizResponse, leaderboardResponse]) => {
        setQuizData(quizResponse.data);
        setLeaderboard(leaderboardResponse.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Update achievements when quiz is completed
  useEffect(() => {
    if (quizCompleted && quizData && quizData.questions) {
      setAchievements(checkAchievements(score));
    }
  }, [quizCompleted, score, quizData]);

  // Handle answer selection
  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // Submit quiz results to the backend
  const submitResults = () => {
    const username = prompt("Enter your name:");
    if (!username) return;

    axios
      .post("http://localhost:5000/api/results", { username, score })
      .then((response) => {
        console.log("Results saved:", response.data);
        setLeaderboard(response.data);
      })
      .catch((error) => console.error("Error saving results:", error));
  };

  // Generate achievements based on score
  const checkAchievements = (score) => {
    const achieved = [];
    // Check if the user got all questions right
    if (score === quizData.questions.length) achieved.push("Perfect Score! 🎉");
    // Check if the score is 8 or more
    if (score >= 8) achieved.push("Mastermind! 🧠");
    // Check if the user answere at least one question correctly
    if (score > 3) achieved.push("Quiz best performace ! 🏆");
    console.log("Achievements:", achieved);
    return achieved;
  };

  // Badge component displays a single badge message based on the score
  const Badge = () => {
    if (score >= 8)
      return <h3 style={{ color: "black" }}>🏆 Champion Badge!</h3>;
    if (score >= 5)
      return <h3 style={{ color: "black" }}>🎖️ Excellent Badge!</h3>;
    return <h3 style={{ color: "black" }}>💡 Keep Going!</h3>;
  };

  // While loading, display a loading message
  if (loading) {
    return <div>Loading quiz data...</div>;
  }

  // If quizData is not available or questions are missing, display an error
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <div>No quiz data available.</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {!quizCompleted ? (
        <div>
          <h2>{currentQuestion.description}</h2>
          <div className="options">
            {currentQuestion.options.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer.is_correct)}
              >
                {answer.description}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="results">
          <h2>Quiz Completed!</h2>
          <p>Your score: {score}</p>
          {/* Badge Component */}
          <Badge />
          {/* Achievements List */}
          {achievements.length > 0 && (
            <div>
              <h3 style={{ color: "black" }}>Achievements:</h3>
              <ul>
                {achievements.map((achievement, index) => (
                  <li key={index} style={{ color: "black" }}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={submitResults}>Submit Results</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;

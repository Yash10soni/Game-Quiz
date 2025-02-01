import React, { useState, useEffect } from "react";
import axios from "axios";
import "./quiz.css"

const Quiz = () => {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:5000/api/quiz"),
      axios.get("http://localhost:5000/api/leaderboard"),
    ])
      .then(([quizResponse, leaderboardResponse]) => {
        console.log("Quiz Data:", quizResponse.data); // Log quiz data to inspect
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

  useEffect(() => {
    if (quizData.length > 0 && score >= 0) {
      setAchievements(checkAchievements(score));
    }
  }, [score, quizData]);

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

  const checkAchievements = (score) => {
    const achieved = [];
    if (score === quizData.questions.length) achieved.push("Perfect Score! 🎉");
    if (score >= 8) achieved.push("Mastermind! 🧠");
    if (score > 0) achieved.push("Quiz Conqueror! 🏆");
    return achieved;
  };

  const Badge = () => {
    if (score >= 8) return <h3>🏆 Champion Badge!</h3>;
    if (score >= 5) return <h3>🎖️ Excellent Badge!</h3>;
    return <h3>💡 Keep Going!</h3>;
  };

  if (loading) {
    return <div>Loading quiz data...</div>;
  }

  if (quizData.length === 0 || !quizData.questions[currentQuestionIndex]) {
    return <div>Loading current question...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div>
      <h2>{currentQuestion.description}</h2>
      <div>
        {currentQuestion.options.map((answer, index) => (
          <button key={index} onClick={() => handleAnswer(answer.is_correct)}>
            {answer.description}
          </button>
        ))}
      </div>
      {quizCompleted && (
        <div>
          <h2>Quiz Completed!</h2>
          <p>Your score: {score}</p>
          <Badge />
          {achievements.length > 0 && (
            <div>
              <h3>Achievements:</h3>
              <ul>
                {achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
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

import React from "react";
import Quiz from "./Components/Quiz";
import "./Components/quiz.css"; // Import your global CSS if needed
import Navbar from "./Components/Navbar";

const App = () => {
  console.log("App Component Rendered"); // Check if App component is loading
  return (
    <>
    <div><Navbar /></div><div>
      <h1>Quiz Application</h1>
      <Quiz />
    </div>
    </>
  );
};

export default App;

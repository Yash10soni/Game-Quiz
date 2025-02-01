import React from "react";
import Quiz from "./Components/Quiz";
import "./index.css"; // Import your global CSS if needed

const App = () => {
  console.log("App Component Rendered"); // Check if App component is loading
  return (
    <div>
      <h1>Quiz Application</h1>
      <Quiz />
    </div>
  );
};

export default App;

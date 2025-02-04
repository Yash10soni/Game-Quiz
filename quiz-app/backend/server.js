const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection using environment variables for sensitive information
const pool = new Pool({
  user: process.env.PG_USER || "postgres",          // Default to "postgres" if not specified
  host: process.env.PG_HOST || "localhost",           // Default to "localhost" for local development
  database: process.env.PG_DATABASE || "quiz_app",    // Default to "quiz_app"
  password: process.env.PG_PASSWORD,                  // Must be set in your .env file
  port: process.env.PG_PORT || 5432,                  // Default PostgreSQL port is 5432
});

// Create table query if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    score INT NOT NULL
  );
`;

// Create the table (or confirm it exists)
pool.query(createTableQuery, (err, res) => {
  if (err) {
    console.error("Error creating table:", err);
  } else {
    console.log("Table created or already exists");
  }
});

// Fetch Quiz Data from API
const QUIZ_API_URL = "https://api.jsonserve.com/Uw5CrX";
app.get("/", (req, res) => {
  res.redirect("http://localhost:3000");
});

app.get("/api/quiz", async (req, res) => {
  try {
    const response = await axios.get(QUIZ_API_URL);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz data" });
  }
});

// Store Quiz Rsults
app.post("/api/results", async (req, res) => {
  const { username, score } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO results (username, score) VALUES ($1, $2) RETURNING *",
      [username, score]
    );
    console.log("Result inserted:", result.rows[0]); // Debug log
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error storing results:", error); // Debug log
    res.status(500).json({ error: "Failed to store results" });
  }
});

// Fetch Leaderboard Data
app.get("/api/leaderboard", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results ORDER BY score DESC LIMIT 10");
    res.json(result.rows);
    console.log(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

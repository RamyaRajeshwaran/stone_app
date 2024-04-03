const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ramya@1601',
  database: 'game',
  authPlugin: 'ramya@1601'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Define Game schema
const gameSchema = `
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player1 VARCHAR(255) NOT NULL,
  player2 VARCHAR(255) NOT NULL
)`;

// Create Game table if not exists
connection.query(gameSchema, (err, result) => {
  if (err) {
    console.error('Error creating Game table:', err);
    return;
  }
  console.log('Game table created or already exists');
});

// API endpoint to create a new game
app.post('/api/games', async (req, res) => {
  try {
    const { player1, player2 } = req.body;
    const insertQuery = `INSERT INTO games (player1, player2) VALUES (?, ?)`;
    connection.query(insertQuery, [player1, player2], (err, result) => {
      if (err) {
        console.error('Error creating game:', err);
        res.status(500).json({ message: 'Failed to create game' });
        return;
      }
      res.status(201).json({ id: result.insertId, player1, player2 });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

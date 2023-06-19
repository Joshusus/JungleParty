const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(cors()); // Enable CORS

// Define the command endpoint
app.post('/command', (req, res) => {
  const command = req.body.command;

  // Update the JSON file with a test property
  const gamestate = require('./gamestate.json');
  gamestate.test = command;

  // Save the updated game state to the JSON file
  fs.writeFile('./gamestate.json', JSON.stringify(gamestate), err => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating game state.');
    } else {
      res.json({ message: 'Game state updated.' });
    }
  });
});

// Define the game state endpoint
app.get('/gamestate', (req, res) => {
  // Read the game state from the JSON file
  fs.readFile('./gamestate.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading game state.');
    } else {
      const gamestate = JSON.parse(data);
      res.json(gamestate);
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

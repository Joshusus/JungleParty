const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(cors()); // Enable CORS

// Define the command endpoint
app.post('/command', (req, res) => {

  const gamestate = require('./gamestate.json');

  const command = req.body.command;
  console.log("Command: '" + command + "'");
  switch (command) {
    case "Explore":
      ActionExplore(req.body, gamestate);
      break;
    case "Open":
      ActionOpen(req.body, gamestate);
      break;
    case "Torch":
      ActionTorch(req.body, gamestate);
      break;
    default:
      console.log("Command '" + req.body.command + "' not recognized")
  }

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

// FUNCTIONS

function RaiseNotification(GameStateNotificationArray, notification) {
  GameStateNotificationArray.push(notification);
  console.log(notification);
}

function ActionExplore(requestBody, gamestate) {
  let roomName = requestBody.Params["Room"].toLowerCase();

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (room) {
    let newItems = room.Items;

    // Update Items List
    let newItemNames = newItems.map(item => item.Name);
    gamestate.Items.push.apply(gamestate.Items, newItemNames);

    //Clear Items in room
    room.Items = [];

    // Update Actions List
    const newActions = newItems
      .filter(item => item.hasOwnProperty('Actions'))
      .map(item => item.Actions)
      .flatMap(actions => actions)
      .filter(action => !gamestate.Actions.some(existingAction => existingAction.Name === action.Name))

    gamestate.Actions.push.apply(gamestate.Actions, newActions);

    let notificationText = "Exploring '" + roomName + "':";
    if (newItems && newItems.length > 0) {
      notificationText += " Found " + newItems.length.toString() + " items!"
    }
    if (newActions && newActions.length > 0) {
      notificationText += " " + newItems.length.toString() + " new action unlocked!"
    }
    RaiseNotification(gamestate.Notifications, notificationText);
  }
}

function ActionOpen(requestBody, gamestate) {
  let roomName = requestBody.Params["FromRoom"].toLowerCase();
  let objectName = requestBody.Params["Object"].toLowerCase();

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (room) {

    let notificationText = "Opening '" + objectName + "' in room '" + roomName + "':";
    RaiseNotification(gamestate.Notifications, notificationText);
  }
  //TODO
}

function ActionTorch(requestBody, gamestate) {
  //TODO
}
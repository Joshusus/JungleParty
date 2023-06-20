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
  switch(req.body.command) {
    case "Explore":
      let roomName = req.body.Params["Room"];
      
      let room = gamestate.Rooms.find(room => room.Name = "HomeRoom");
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

        var notificationText = "Exploring '" + roomName + "':";
        if (newItems && newItems.length > 0) {
          notificationText += " Found " + newItems.length.toString() + " items!"
        }
        if (newActions && newActions.length > 0) {
          notificationText += " " + newItems.length.toString() + " new action unlocked!"
        }
        RaiseNotification(gamestate.Notifications, notificationText);

      }
      
      break;
    case "Open":

      break;
      case "Torch":
        break;
    default:
      console.log("Command '" + req.body.command + "' not recognized")
  }



  // Update the JSON file with a test property
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

// SHARED FUNCTIONS

function RaiseNotification(GameStateNotificationArray, notification) {
  GameStateNotificationArray.push(notification);
  console.log(notification);
}

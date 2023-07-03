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
  let responseObject = null;

  console.log("Command: '" + command + "'");
  switch (command) {
    case "Explore":
      responseObject = ActionExplore(req.body, gamestate);
      break;
    case "Open":
      responseObject = ActionOpen(req.body, gamestate);
      break;
    case "Key":
      responseObject = ActionKey(req.body, gamestate);
      break;
    case "Torch":
      responseObject = ActionTorch(req.body, gamestate);
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

      if (!responseObject) {
        responseObject = { message: 'Game state updated.' };
      }
      res.json(responseObject);
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

  let room = gamestate.Rooms.find(room => room.Discovered && room.Name.toLowerCase() == roomName);
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

    let responseText = "Exploring '" + roomName + "': ";
    let notificationText = "Exploring '" + roomName + "': ";

    if (room.Objects && room.Objects.length > 0) {
      const objectInfoArray = room.Objects.map(obj => {
        if (obj.Lock) {
          return obj.Name + " (locked by " + obj.Lock + ")";
        } else {
          return obj.Name;
        }
      });
      responseText += "This room has objects: " + objectInfoArray.join(", ") + ". ";
    }

    if (newItems && newItems.length > 0) {
      notificationText += " Found " + newItems.length.toString() + " items!";
      responseText += " Found " + newItems.map(obj => obj.Name).join(", ");
    }
    if (newActions && newActions.length > 0) {
      notificationText += " " + newItems.length.toString() + " new action unlocked!";
      responseText += ": " + newItems.length.toString() + " new action unlocked!";
    } else responseText += "!";
    RaiseNotification(gamestate.Notifications, notificationText);

    return { message: responseText, room: room.Name };
  } else {

    return { message: "Room with name '" + roomName + "' has not been discovered." };
  }
}

function ActionOpen(requestBody, gamestate) {
  let roomName = requestBody.Params["FromRoom"].toLowerCase();
  let objectName = requestBody.Params["Object"].toLowerCase();

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (room) {
    let notificationText = "Opening '" + objectName + "' in room '" + roomName + "': ";
    let responseText = "Opening '" + objectName + "' in room '" + roomName + "': ";
    let responseRoom = null;

    let object = room.Objects.find(object => object.Name.toLowerCase() == objectName);

    if (object) {
      // Door
      if (object.Name.toLowerCase().includes("door")) {
        if (object.Lock) {
          responseText += "This Door is locked by '" + object.Lock + "'.";
          return { message: responseText };
        } else {
          let NewRoomId = object.GoesTo;
          let newRoom = gamestate.Rooms.find(room => room.Id == NewRoomId);
          if (newRoom.Discovered) responseText += "You walk through to room " + objectName + ".";
          else {
            newRoom.Discovered = true;
            responseRoom = newRoom.Name;
            responseText += "You walk through and discover " + newRoom.Name + "!";
            if (newRoom.Dark) responseText += " This room is very dark...";
            notificationText += "New room discovered: " + newRoom.Name;
          }
        }
      }
    } else {
      responseText += "Could not find object '" + objectName + "'.";
      return { message: responseText };
    }

    RaiseNotification(gamestate.Notifications, notificationText);
    return { message: responseText, room: responseRoom };
  } else {
    responseText += "Could not find room '" + roomName + "'.";
    return { message: responseText };
  }
}

function ActionKey(requestBody, gamestate) {
  let roomName = requestBody.Params["FromRoom"].toLowerCase();
  let objectName = requestBody.Params["Object"].toLowerCase();
  let keyColour = requestBody.Params["KeyColour"].toLowerCase();

  let key = gamestate.Items.find(item => item.toLowerCase().includes(keyColour));
  if (!key) {
    responseText = "You do not have the " + keyColour + " key.";
    return { message: responseText };
  }

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (!room) {
    responseText = "Could not find room '" + roomName + "'.";
    return { message: responseText };
  }

  let object = room.Objects.find(obj => obj.Name.toLowerCase() == objectName);
  if (!object) {
    responseText = "Could not find object '" + objectName + "' in room '" + roomName + "'.";
    return { message: responseText };
  }

  if (!object.Lock) {
    responseText = "The object '" + objectName + "' is not locked.";
    return { message: responseText };
  }

  if (object.Lock.toLowerCase() != key.toLowerCase()) {
    responseText = "The object '" + objectName + "' can only be unlocked by the " + object.Lock + ", not by the " + key + ".";
    return { message: responseText };
  }

  object.Lock = null;

  let notificationText = "The '" + object.Name + "' in " + room.Name + " has been unlocked with the " + key + "!";
  let responseText = "Unlocked '" + object.Name + "' with the " + key + "!";
  RaiseNotification(gamestate.Notifications, notificationText);
  return { message: responseText };
}

function ActionTorch(requestBody, gamestate) {
  //TODO
}
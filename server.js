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
    case "Riddle":
      responseObject = ActionRiddle(req.body, gamestate);
      break;
    case "Water":
      responseObject = ActionWater(req.body, gamestate);
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

app.get('/reward/:Name', (req, res) => {
  let rewardName = req.params.Name;
  const gamestate = require('./gamestate.json');

  let reward = gamestate.Rewards.find(reward => reward.Name.toLowerCase() == rewardName.toLowerCase());

  if (!reward) {
    res.status(400).send('Reward Id not found. ');
    return;
  }

  if (reward.Discovered) {
    res.status(400).send('Reward already found.');
    return;
  }

  let responseText = "Reward activated! ";

  if (reward.Items) {
    gamestate.Items.push.apply(gamestate.Items, reward.Items);
    responseText += "Items found: " + reward.Items.map(obj => obj.Name).join(", ") + ". ";

    const newActions = reward.Items
      .filter(item => item.hasOwnProperty('Actions'))
      .map(item => item.Actions)
      .flatMap(actions => actions)
      .filter(action => !gamestate.Actions.some(existingAction => existingAction.Name === action.Name))

    gamestate.Actions.push.apply(gamestate.Actions, newActions);
  }

  if (reward.Clues) {
    for (const clue of reward.Clues) {
      let RiddleData = gamestate.Riddles.find(riddle => riddle.Name.toLowerCase() == clue.Name.toLowerCase());
      RiddleData.Clue = clue.Clue;
    }
    responseText += "Clues found: " + reward.Clues.map(clue => clue.Name).join(", ") + ". ";
  }

  reward.Discovered = true;

  // Save the updated game state to the JSON file
  fs.writeFile('./gamestate.json', JSON.stringify(gamestate), err => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating game state.');
    } else {

      RaiseNotification(gamestate.Notifications, responseText);
      res.status(200).send(responseText);
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
    room.Explored = true;
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
      if (newActions && newActions.length > 0) {
        notificationText += " " + newItems.length.toString() + " new action unlocked!";
        responseText += ": " + newItems.length.toString() + " new action unlocked!";
      } else responseText += "!";
      RaiseNotification(gamestate.Notifications, notificationText);
    }

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
          responseRoom = newRoom.Name;
          if (newRoom.Discovered) responseText += "You walk through to room " + newRoom.Name + ".";
          else {
            newRoom.Discovered = true;
            responseText += "You walk through and discover " + newRoom.Name + "!";
            if (newRoom.Dark) responseText += " This room is very dark...";
            notificationText += "New room discovered: " + newRoom.Name;
            RaiseNotification(gamestate.Notifications, notificationText);
          }
        }
      }
    } else {
      responseText += "Could not find object '" + objectName + "'.";
      return { message: responseText };
    }

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
    let responseText = "You do not have the " + keyColour + " key.";
    return { message: responseText };
  }

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (!room) {
    let responseText = "Could not find room '" + roomName + "'.";
    return { message: responseText };
  }

  let object = room.Objects.find(obj => obj.Name.toLowerCase() == objectName);
  if (!object) {
    let responseText = "Could not find object '" + objectName + "' in room '" + roomName + "'.";
    return { message: responseText };
  }

  if (!object.Lock) {
    let responseText = "The object '" + objectName + "' is not locked.";
    return { message: responseText };
  }

  if (object.Lock.toLowerCase() != key.toLowerCase()) {
    let responseText = "The object '" + objectName + "' can only be unlocked by the " + object.Lock + ", not by the " + key + ".";
    return { message: responseText };
  }

  object.Lock = null;

  let notificationText = "The '" + object.Name + "' in " + room.Name + " has been unlocked with the " + key + "!";
  let responseText = "Unlocked '" + object.Name + "' with the " + key + "! Continue on, brave explorer...";
  RaiseNotification(gamestate.Notifications, notificationText);
  return { message: responseText };
}

function ActionRiddle(requestBody, gamestate) {
  let roomName = requestBody.Params["FromRoom"].toLowerCase();
  let objectName = requestBody.Params["Object"].toLowerCase();
  let riddleAnswer = requestBody.Params["Answer"].toLowerCase();

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (!room) {
    let responseText = "Could not find room '" + roomName + "'.";
    return { message: responseText };
  }

  let object = room.Objects.find(obj => obj.Name.toLowerCase() == objectName);
  if (!object) {
    let responseText = "Could not find object '" + objectName + "' in room '" + roomName + "'.";
    return { message: responseText };
  }

  if (!object.Lock) {
    let responseText = "The object '" + objectName + "' is not locked.";
    return { message: responseText };
  }

  if (!object.Lock.toLowerCase().includes("riddle")) {
    let responseText = "The object '" + objectName + "' can only be unlocked by the " + object.Lock + ", not by a riddle answer.";
    return { message: responseText };
  }

  let RiddleData = gamestate.Riddles.find(riddle => riddle.Name.toLowerCase() == object.Lock.toLowerCase());

  if (riddleAnswer.toLowerCase() != RiddleData.Answer.toLowerCase()) {
    let responseText = "Wrong!";
    return { message: responseText };
  }

  object.Lock = null;

  let notificationText = "The '" + object.Name + "' in " + room.Name + " has been unlocked with the riddle answer: '" + riddleAnswer + "'!";
  let responseText = "Correct! Unlocked " + object.Name + "! March forth intrepid venturer...";
  RaiseNotification(gamestate.Notifications, notificationText);
  return { message: responseText };
}

function ActionWater(requestBody, gamestate) {

  let roomName = requestBody.Params["FromRoom"].toLowerCase();
  let objectName = requestBody.Params["Object"].toLowerCase();

  if (!objectName || objectName.replace(/\s/g, '').toLowerCase() === "watertank") {
    return { message: "You cannot water this object!" };
  }

  let room = gamestate.Rooms.find(room => room.Name.toLowerCase() == roomName);
  if (!room) {
    let responseText = "Could not find room '" + roomName + "'.";
    return { message: responseText };
  }

  let watertank = room.Objects.find(obj => obj.Name.toLowerCase() == objectName);

  var waterBottle = items.find(function (item) {
    return item.Name === 'Water Bottle';
  });

  if (!waterBottle) {
    return { message: "You do not have any water bottles to use this action." };
  }

  if (watertank.CurrentWater == watertank.Target) {
    return { message: "The water tank is already full - there is no further use from this object." };
  }

  // remove water bottle from inventory
  var index = items.indexOf(waterBottle);
  items.splice(index, 1);

  watertank.CurrentWater += 1;
  if (watertank.CurrentWater == watertank.Target) {
    let unlockedObject = room.Objects.find(obj => obj.Name == watertank.Unlocks);
    unlockedObject.Lock = null;
        
    let notificationText = "The '" + watertank.Target + "' in " + room.Name + " has been unlocked with the water tank!";  
    RaiseNotification(gamestate.Notifications, notificationText);
    return { message: "You pour water into the tank, and the water reaches the top! A creaking can be heard inside as mechanisms come to life... something has happened to " + watertank.Unlocks };
  } else {
    return { message: "You pour water into the tank, raising the water level. You can see something inside the tank rise slightly with the water..." };
  }
}

function ActionTorch(requestBody, gamestate) {
  //TODO
}
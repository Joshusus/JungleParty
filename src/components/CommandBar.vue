<script>
export default {
  data() {
    return {
      command: '',
      sendParams: [],
      gamestate: {},
      currentRoom: 'Entrance',
      actionResponse: ''
    };
  },
  computed: {
    currentCommand() {
      return this.gamestate.Actions.find(action => action.Name === this.command);
    },
    notifications() {
      if (!this.gamestate.Notifications) return [];
      return this.gamestate.Notifications.slice().reverse();
    },
    defaultParamValue() {
      return function (param) {
        if (param === 'Room') {
          return this.currentRoom;
        } else {
          return '';
        }
      };
    }
  },
  methods: {
    sendCommand() {
      // Get the values of the input fields
      const paramValues = {};
      this.currentCommand.Params.forEach(param => {
        const inputField = document.getElementById(param);
        paramValues[param] = inputField.value;
      });

      if (this.currentRoom) {
        paramValues["FromRoom"] = this.currentRoom;
      }

      // Send the command to the server using AJAX
      fetch('http://localhost:3000/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: this.command,
          Params: paramValues,
        })
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response from the server
          console.log(data);
          this.actionResponse = data.message;
          if (data.room) this.currentRoom = data.room;
          this.fetchGamestate();
        })
        .catch(error => {
          console.error(error);
        });
    },
    fetchGamestate() {
      // Fetch the game state from the server on page load
      fetch('http://localhost:3000/gamestate')
        .then(response => response.json())
        .then(data => {
          this.gamestate = data;
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  mounted() {
    // Call the fetchGamestate method when the component is mounted (on page load)
    this.fetchGamestate();
  }
};
</script>

<template>
  <div class="commandbar">
    <div>
      <div style="background-color:rgba(5,92,79,255)">
        <div v-if="currentRoom">You are in Room: {{ currentRoom }}</div>
        <p>Please enter a command: </p>
        Action:
        <select list="commands" id="command" name="command" v-model="command">
          <option v-for="action in gamestate.Actions" :key="action.Name">{{ action.Name }}</option>
        </select>
        <div v-if="command">
          <div v-for="param in currentCommand.Params" :key="param">
            {{ param }}:
            <input class="actionParam" type="text" :id="param" :value="defaultParamValue(param)" />
          </div>
        </div>
        <button @click="sendCommand">Send</button>
      </div>

      <div>
        <b style="color:hotpink">{{ actionResponse }}</b>
      </div>

      <p>&nbsp;</p>
      <hr class="logo" />

      <h2>Story</h2>
      <div v-for="notification in notifications" :key="notification">
        {{ notification }}
      </div>

      <p>&nbsp;</p>
      <hr class="logo" />
    </div>

  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {

  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>

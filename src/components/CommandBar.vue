<script>
export default {
  data() {
    return {
      command: '',
      gamestate: {}
    };
  },
  methods: {
    sendCommand() {
      // Send the command to the server using AJAX
      fetch('http://localhost:3000/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: this.command })
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response from the server
          console.log(data);
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
    <div style="background-color:darkseagreen">
      <!--<p>Gamestate: '{{ gamestate.Actions }}'</p>-->
      
      Actions:
      <ul>
        <li v-for="action in gamestate.Actions" :key="action">{{ action }}</li>
      </ul>   

      <p>Please enter a command: </p>
      <p>Format: <b> ACTION PARAM1 PARAM2 ... </b></p>
      <input type="text" v-model="command" />
      <button @click="sendCommand">Send</button>
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

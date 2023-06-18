<script>
export default {
  data() {
    return {
      command: ''
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
    }
  }
};
</script>

<template>
  <div class="commandbar">
    <div style="background-color:darkseagreen">
      Please enter a command:
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

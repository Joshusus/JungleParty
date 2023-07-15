<script>
export default {
  data() {
    return {
      gamestate: {}
    };
  },
  methods: {
    fetchGamestate() {
      // Fetch the game state from the server on page load
      fetch('https://jjapi.onrender.com/gamestate')
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
  <div>
    <div style="background-color:rgba(5,92,79,255)">

        <h2>Items:</h2>
        <ul v-for="item in gamestate.Items" :key="item">
          <li>{{item}}</li>
        </ul>

        <hr/>

        <h2>Actions:</h2>
        <p style="font-style: italic;">(derived from inventory items)</p>
        <ul v-for="item in gamestate.Actions" :key="item.Name">
          <li>{{item.Name}}</li>
        </ul>

    </div>

  </div>
</template>


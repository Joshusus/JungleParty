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

        <h2>Items:</h2>
        <ul v-for="item in gamestate.Items" :key="item">
          <li>{{item}}</li>
        </ul>


        <h2>Actions (derived from inventory items):</h2>
        <ul v-for="item in gamestate.Actions" :key="item.Name">
          <li>{{item.Name}}</li>
        </ul>

    </div>

  </div>
</template>


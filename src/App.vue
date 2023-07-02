<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.png" width="125" height="125" />

    <div class="wrapper page">
      <nav>
        <RouterLink to="/">Explore</RouterLink> | 
        <RouterLink to="/about">Inventory</RouterLink>
      </nav>
      
      <hr/>
    </div>
  </header>
  <RouterView />
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}

body {
  background-image: url("./assets/background.png");
  background-repeat: repeat;
}

.page {
  background-color: rgb(24, 21, 48);
  color: ivory;
  padding: 5px;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.hello {
  background-color: rgb(24, 21, 48);
  color: ivory;

}


</style>

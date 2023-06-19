<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.png" width="125" height="125" />

    <div class="wrapper">
      <nav class="page">
        <RouterLink to="/">Explore</RouterLink> | 
        <RouterLink to="/about">Inventory</RouterLink>
      </nav>
    </div>
  </header>
  <hr/>

  <RouterView />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
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

hr {
  overflow: visible;
  padding: 0;
  border: none;
  height: 1px;
  background-image: linear-gradient(to right,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.75),
      rgba(0, 0, 0, 0));
  text-align: center;
}

hr:after {
  content: " ";
  display: inline-block;
  position: relative;
  top: -1.8em;
  font-size: 1.5em;
  padding: 19px 1.75em;
  background: url(./assets/calendar64.png) no-repeat scroll center;
  background-size: 30px 30px;
  height: 50px;
}
</style>

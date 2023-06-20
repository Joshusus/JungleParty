<script setup>
import Inventory from '../components/Inventory.vue'
</script>

<template>
  <div class="about">
    <h1>Inventory</h1>

    <Inventory />

  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

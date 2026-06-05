<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import 'vue-toast-notification/dist/theme-sugar.css';
</script>

<template>
  <NavBar />
  <main>
    <RouterView />
  </main>
  <footer><p>Carnet - 2026</p></footer>
</template>

<style scoped></style>

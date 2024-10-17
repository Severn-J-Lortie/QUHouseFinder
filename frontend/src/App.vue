<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from './stores/user';
const user = useUserStore();
user.login();
</script>

<template>
  <RouterView />
</template>

<style scoped>  
</style>

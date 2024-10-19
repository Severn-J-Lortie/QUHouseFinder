<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from './stores/user';
import { useToast } from './hooks/useToast'
const toast = useToast();
const user = useUserStore();
user.checkForSession().catch((error) => {
  toast.add('error', 'Failed to login', error.message);
})
</script>

<template>
  <RouterView />
</template>

<style scoped>  
</style>

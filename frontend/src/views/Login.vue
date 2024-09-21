<script setup>
import { useAuth0 } from '@auth0/auth0-vue';
const { loginWithRedirect, logout } = useAuth0();
</script>

<template>
  <Button @click="loginWithRedirect()">Login</Button>
  <Button @click="logout()">Logout</Button>
</template>
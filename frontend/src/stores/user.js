import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const signedIn = ref(false);
  async function login() {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/me`, {
      credentials: 'include'
    });
    const { loggedIn } = await response.json();
    if (loggedIn) {
      signedIn.value = true;
      return;
    }
    signedIn.value = false;
  }

  return { signedIn, login }
});

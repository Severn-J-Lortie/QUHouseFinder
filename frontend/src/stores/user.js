import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);

  async function checkForSession() {
    if (loggedIn.value) {
      return true;
    }
    const responseJSON = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/me`, {
      credentials: 'include'
    });
    const response = await responseJSON.json();
    if (!response.success) {
      throw new Error(response.errorMessage);
    }
    loggedIn.value = response.loggedIn;
    return loggedIn.value;
  }

  async function login(email, password) {
    const loginResponseJSON = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password
      })
    });
    const loginResponse = await loginResponseJSON.json();
    if (!loginResponse.success) {
      throw new Error(loginResponse.errorMessage);
    }
    loggedIn.value = true;
  }

  async function register(email, password, name) {
    const registerResponseJSON = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name,
        email,
        password
      })
    });
    const registerResponse = await registerResponseJSON.json();
    if (!registerResponse.success) {
      throw new Error(registerResponse.errorMessage);
    }
    loggedIn.value = true;
  }

  return { loggedIn, checkForSession, login, register }
});

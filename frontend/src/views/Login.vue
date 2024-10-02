<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const user = useUserStore();

const loginInfo = ref({
  email: '',
  password: ''
});

const signupInfo = ref({
  name: '',
  email: '',
  password: ''
});

const loginFeedback = ref("");
const signupFeedback = ref("");

function requireValidEmail(value) {
  const emailRegex = /.+\@.+\..+/;
  return emailRegex.test(value);
}

function requireLengthGreaterThan(value, length) {
  if (typeof value.length !== 'undefined') {
    return value.length > length;
  }
  return false;
}

async function login() {
  if (!requireValidEmail(loginInfo.value.email)) {
    loginFeedback.value = 'Please provide a valid email';
    return;
  }
  if (!requireLengthGreaterThan(loginInfo.value.password, 0)) {
    loginFeedback.value = 'Please enter your password';
    return;
  }
  const loginResponseJSON = await fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: loginInfo.value.email,
      password: loginInfo.value.password
    })
  });
  const loginResponse = await loginResponseJSON.json();
  if (!loginResponse.success) {
    loginFeedback.value = loginResponse.errorMessage;
    return;
  }
  loginFeedback.value = '';
  router.push('/');
  user.signedIn = true;
}

async function signup() {
  if (!requireLengthGreaterThan(signupInfo.value.name, 0)) {
    signupFeedback.value = 'Please provide a valid name';
    return;
  }
  if (!requireValidEmail(signupInfo.value.email)) {
    signupFeedback.value = 'Please provide a valid email';
    return;
  }
  if (!requireLengthGreaterThan(signupInfo.value.password, 0)) {
    signupFeedback.value = 'Please enter your password';
    return;
  }
  const signupResponseJSON = await fetch('http://localhost:8080/register', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: signupInfo.value.name,
      email: signupInfo.value.email,
      password: signupInfo.value.password
    })
  });
  const signupResponse = await signupResponseJSON.json();
  if (!signupResponse.success) {
    signupFeedback.value = signupResponse.errorMessage;
    return;
  }
  signupFeedback.value = '';
  router.push('/');
  user.signedIn = true;
}

</script>

<template>
  <div class="card">
    <header>
      <Image src="/src/assets/logo.png" width="100" />
      <h1>
        QUHouseFinder
      </h1>
    </header>
    <div class="login-form">
      <div>
        <InputText id="email" placeholder="Email" v-model="loginInfo.email" />
        <InputText id="password" placeholder="Password" type="password" v-model="loginInfo.password" />
        <Button @click="login()">Login</Button>
        <div class="feedback">{{ loginFeedback }}</div>
      </div>
    </div>
    <h2>Sign Up</h2>
    <divider/>
    <div class="login-form">
      <div>
        <InputText id="name" placeholder="Name" v-model="signupInfo.name" />
        <InputText id="email" placeholder="Email" v-model="signupInfo.email" />
        <InputText id="password" placeholder="Password" type="password" v-model="signupInfo.password" />
        <Button @click="signup()">Sign up</Button>
        <div class="feedback">{{signupFeedback}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  width: 100%;
}
header {
  display: flex;
  align-items: center;
  justify-content: center;
}

header>h1 {
  margin-left: 20px;
}

.card {
  max-width: 500px;
  margin: 0px auto;
  /* text-align: center; */
}

.login-form {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.feedback {
  margin-top: 10px;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word; 
  max-width: 159px;
}

input {
  margin-top: 10px;
  margin-bottom: 10px;
  display: block;
}
</style>
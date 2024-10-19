<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useToast } from '@/hooks/useToast';

const router = useRouter();
const user = useUserStore();
const toast = useToast();

const loginInfo = ref({
  email: '',
  password: '',
});

const registerInfo = ref({
  name: '',
  email: '',
  password: '',
});

const loginFeedback = ref("");
const registerFeedback = ref("");

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
  try {
    await user.login(loginInfo.value.email, loginInfo.value.password);
    router.push('/');
    loginFeedback.value = '';
  } catch (error) {
    toast.add('Error', 'Login Error', error.message);
  }
}

async function register() {
  if (!requireLengthGreaterThan(registerInfo.value.name, 0)) {
    registerFeedback.value = 'Please provide a valid name';
    return;
  }
  if (!requireValidEmail(registerInfo.value.email)) {
    registerFeedback.value = 'Please provide a valid email';
    return;
  }
  if (!requireLengthGreaterThan(registerInfo.value.password, 0)) {
    registerFeedback.value = 'Please enter your password';
    return;
  }
  try {
    await user.register(registerInfo.value.email, registerInfo.value.password, registerInfo.value.name);
    registerFeedback.value = '';
    router.push('/');
  } catch (error) {
    toast.add('error', 'Signup Error', error.message);
  }
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
        <InputText placeholder="Email" v-model="loginInfo.email" />
        <InputText placeholder="Password" type="password" v-model="loginInfo.password" />
        <Button @click="login()">Login</Button>
        <div class="feedback">{{ loginFeedback }}</div>
      </div>
    </div>
    <h2>Sign Up</h2>
    <divider/>
    <div class="login-form">
      <div>
        <InputText placeholder="Name" v-model="registerInfo.name" />
        <InputText placeholder="Email" v-model="registerInfo.email" />
        <InputText placeholder="Password" type="password" v-model="registerInfo.password" />
        <Button @click="register()">Sign up</Button>
        <div class="feedback">{{registerFeedback}}</div>
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
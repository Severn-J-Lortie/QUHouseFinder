<script setup>
</script>

<template>
  <div class="card">
    <header>
      <h1>
        <i class="pi pi-bell" style="font-size: 1.7rem"></i>
        Notify Me
      </h1>
      <p>Get emails when new listings show up under your saved filters</p>
    </header>
    <RouterLink to="/login">
      <Button>Signup/Login</Button>
    </RouterLink>
  </div>
</template>

<style scoped>
.card > header > p {
  font-size: 1.25rem;
}
</style>
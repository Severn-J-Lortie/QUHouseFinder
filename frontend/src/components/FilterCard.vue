<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

import FilterCardConstraintMenu from './FilterCardConstraintMenu.vue';

const user = useUserStore();
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
    <RouterLink to="/login" v-if="!user.signedIn">
      <Button>Signup/Login</Button>
    </RouterLink>
    <div id="filters-container">
      <div class="filter-field">
        <div for="address">Address</div>
        <InputText id="address" placeholder="Address"/>
        <FilterCardConstraintMenu/>
      </div>
      <div class="filter-field">
        <div for="beds">Beds</div>
        <InputText id="beds" placeholder="Number of beds"/>
        <FilterCardConstraintMenu data-type="number"/>
      </div>
      <div class="filter-field">
        <div for="rent">Rent</div>
        <InputText id="rent" placeholder="Rent"/>
        <FilterCardConstraintMenu data-type="number"/>
      </div>
      <div class="filter-field">
        <div for="rent">Rental Type</div>
        <InputText id="rent" placeholder="Rent"/>
        <FilterCardConstraintMenu data-type="number"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card>header>p {
  font-size: 1.25rem;
}
#filters-container {
  display: flex;
}
.filter-field {
  margin-right: 20px;
}
</style>
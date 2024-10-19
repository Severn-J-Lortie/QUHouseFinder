<script setup>
import { ref } from 'vue';

import { useToast } from '@/hooks/useToast';

import { useUserStore } from '@/stores/user';
import { useFiltersStore } from '@/stores/filters';

import FilterCardConstraintMenu from './FilterCardConstraintMenu.vue';
const toast = useToast();
const rentalTypes = ref([
  'Sublet',
  'Apartment',
  'House',
  'Room'
]);

const user = useUserStore();
const filters = useFiltersStore();

try {
  await user.checkForSession();
} catch (error) {
  console.error(error);
}

if (user.loggedIn) {
  try {
    await filters.fetchFilters();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Unable to fetch filters: ${error.message}` });
  }
}

async function updateFilters() {
  for (const {id, fields} of filters.filters) {
    await filters.updateFilter(id, fields)
  }
  toast.add('success', 'Update Successful', 'Your filters have been saved');
}

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
    <RouterLink to="/login" v-if="!user.loggedIn">
      <Button>Signup/Login</Button>
    </RouterLink>
    <div class="filter" v-for="{id, fields} in filters.filters">
      <div class="filter-field">
        <div>Address</div>
        <InputText placeholder="Address" v-model="fields.address.value" />
        <FilterCardConstraintMenu data-type="string" v-model="fields.address.matchMode" />
      </div>
      <div class="filter-field">
        <div>Beds</div>
        <InputText placeholder="Number of beds" v-model="fields.beds.value" />
        <FilterCardConstraintMenu data-type="number" v-model="fields.beds.matchMode" />
      </div>
      <div class="filter-field">
        <div>Rent</div>
        <InputText placeholder="Rent" v-model="fields.priceperbed.value" />
        <FilterCardConstraintMenu data-type="number" v-model="fields.priceperbed.matchMode" />
      </div>
      <div class="filter-field">
        <div>Rental Type</div>
        <Select class="min-width" placeholder="Rental Type" :options="rentalTypes" v-model="fields.rentaltype.value" />
      </div>
      <div class="filter-field">
        <div>Start Date</div>
        <DatePicker dateFormat="dd/mm/yy" placeholder="dd/mm/yy" v-model="fields.leasestartdate.value" />
        <FilterCardConstraintMenu data-type="date" v-model="fields.leasestartdate.matchMode" />
      </div>
      <div class="filter-field align-bottom">
        <Button icon="pi pi-trash" text rounded severity="secondary" @click="filters.deleteFilter(id)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card>header>p {
  font-size: 1.25rem;
}

.filter {
  display: flex;
  margin-bottom: 10px;
}

.filter .filter-field:nth-child(5) {
  margin-right: 0px;
}

.filter-field {
  margin-right: 20px;
}

.min-width {
  min-width: 130px;
}

.align-bottom {
  align-self: flex-end;
}

</style>
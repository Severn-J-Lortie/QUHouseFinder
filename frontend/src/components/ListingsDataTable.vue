<script setup>
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useListingsStore } from '@/stores/listings';
import { useFiltersStore } from '@/stores/filters';
import { useUserStore } from '@/stores/user';
import { useToast } from "@/hooks/useToast";

const toast = useToast();
const listingsStore = useListingsStore();
const filtersStore = useFiltersStore();
const user = useUserStore();

// TODO: This should be top level await with a Suspense
listingsStore.fetchListings();

const expandedRows = ref({});
const filters = ref({
  address: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  beds: { value: null, matchMode: FilterMatchMode.EQUALS },
  priceperbed: { value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
  rentaltype: { value: null, matchMode: FilterMatchMode.EQUALS },
  leasestartdate: { value: null, matchMode: FilterMatchMode.DATE_IS },
});

async function saveFilter() {
  try {
    await filtersStore.saveFilter(filters.value);
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Unable to save filter: ${error.message}`, life: 3000 });
    console.error(error);
  }
}

const rentalTypes = ref([
  'Sublet',
  'Apartment',
  'House',
  'Room'
]);

function formatCurrency(amount) {
  if (typeof amount === 'number') {
    return amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
  }
}

function formatDate(dateString) {
  if (dateString instanceof Date) {
    return dateString.toLocaleDateString('en-CA', {
      month: 'long',
      year: 'numeric',
      day: 'numeric'
    });
  }
}

</script>

<template>
  <div class="card">
    <header>
      <h1>
        <i class="pi pi-home" style="font-size: 1.7rem"></i>
        Current Listings
      </h1>
    </header>
    <DataTable v-model:filters="filters" v-model:expandedRows="expandedRows" :value="listingsStore.listings" paginator
      :rows="10" dataKey="hash" tableStyle="min-width: 60rem" filterDisplay="row">
      <template #expansion="slotProps">
        <h3>More Info </h3>
        <ul>
          <li v-if="slotProps.data.baths">
            Baths: {{ slotProps.data.baths }}
          </li>
        </ul>
        <h4>Description</h4>
        <p style="white-space: pre-line;">{{ slotProps.data.description }}</p>
      </template>
      <Column expander style="width: 5rem"></Column>
      <Column header="Address" field="address">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Address" />
        </template>
      </Column>
      <Column header="Beds" field="beds" dataType="numeric">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Number of beds" />
        </template>
      </Column>
      <Column header="Rent" filterField="priceperbed" dataType="numeric">
        <template #body="{ data }">
          {{ formatCurrency(data.priceperbed) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Rent" />
        </template>
      </Column>
      <Column header="Rental Type" field="rentaltype" :showFilterMenu="false">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model="filterModel.value" :options="rentalTypes" placeholder="Any"
            @change="filterCallback()"></Select>
        </template>
      </Column>
      <Column header="Start Date" filterField="leasestartdate" dataType="date">
        <template #body="{ data }">
          {{ formatDate(data.leasestartdate) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yy"
            @date-select="filterCallback" />
        </template>
      </Column>
      <Column header="Link" :show-filter-menu="false">
        <template #filter>
          <Button @click="saveFilter()" :disabled="!user.loggedIn">
            {{ user.loggedIn ? 'Save Filter' : 'Login to Save Filters' }}
          </Button>
        </template>
        <template #body="{ data }">
          <Button link as="a" :label="data.landlord" :href="data.link" target="_blank" rel="noopener"
            style="padding: unset;"></Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.justify-end {
  display: flex;
  justify-content: flex-end;
}
</style>
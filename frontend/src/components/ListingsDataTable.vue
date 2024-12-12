<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router'
import { useListingsStore } from '@/stores/listings';
import { useFiltersStore } from '@/stores/filters';
import { useUserStore } from '@/stores/user';
import { useToast } from "@/hooks/useToast";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const listingsStore = useListingsStore();
const filtersStore = useFiltersStore();
const user = useUserStore();

filtersStore.resetActiveFilter();


async function init() {
  try {
    await user.checkForSession();
  } catch (error) {
    console.error(error);
  }

  const selectedFilter = route.query['filter'];
  if (!user.loggedIn && selectedFilter) {
    router.push('/login');
  }

  if (user.loggedIn) {
    try {
      await filtersStore.fetchFilters();
    } catch (error) {
      toast.add('error', 'Error', `Unable to fetch filters: ${error.message}`);
      console.error(error);
    }
  }

  if (selectedFilter) {
    try {
      filtersStore.setActiveFilter(selectedFilter);
      toast.add('success', 'Success', 'Viewing filter');
    } catch {
      toast.add('error', 'Error', 'Unable to find the requested filter');
    }
  }

  listingsStore.fetchListings();
}
init();
const expandedRows = ref({});

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
    <DataTable v-model:filters="filtersStore.activeFilter" v-model:expandedRows="expandedRows"
      :value="listingsStore.listings" paginator :rows="10" dataKey="hash" tableStyle="min-width: 60rem"
      filterDisplay="row">
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
          <Button type="button" id='clear-button' label="Clear" outlined @click="filtersStore.resetActiveFilter()" />
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

#clear-button {
  margin-left: 15px;
}
</style>
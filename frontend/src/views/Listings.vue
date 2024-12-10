<script setup>
import ListingDataTable from '@/components/ListingsDataTable.vue';
import FiltersCard from '@/components/FilterCard.vue';
import logoImg from '@/assets/logo.png'
</script>
<template>
  <Toast />
  <div class="card">
    <header>
      <Image :src="logoImg" width="50" />
      <h1>
        QUHouseFinder (beta)
      </h1>
    </header>
    Welcome to QUHouseFinder! Below are the most recent student rentals in Kingston, aggregated from a number of data sources.
  </div>
  <ListingDataTable/>
  <Suspense>
    <template #default>
      <FiltersCard/>
    </template>
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>

<style scoped>
  header {
    display: flex;
    align-items: center;
  }
  header > h1 {
    margin-left: 10px;
  }
</style>
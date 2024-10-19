<script setup>
import ListingDataTable from '@/components/ListingsDataTable.vue';
import FiltersCard from '@/components/FilterCard.vue';
</script>
<template>
  <Toast />
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
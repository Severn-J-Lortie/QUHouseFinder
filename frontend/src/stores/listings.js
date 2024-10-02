import { ref } from 'vue'
import { defineStore } from 'pinia'
import quconfig from '../../quconfig.json';

export const useListingsStore = defineStore('listings', () => {
  const listings = ref([]);
  async function fetchListings() {
    const response = await fetch(`${quconfig.backendLocation}/listings`);
    const listingsStringDate = await response.json();
    for (const listing of listingsStringDate) {
      listing.leasestartdate = new Date(listing.leasestartdate);
      listings.value.push(listing);
    }
  }
  return { listings, fetchListings }
})

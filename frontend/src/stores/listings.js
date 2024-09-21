import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useListingsStore = defineStore('listings', () => {
  const listings = ref([]);
  async function fetchListings() {
    const response = await fetch('http://localhost:8080/listings');
    const listingsStringDate = await response.json();
    for (const listing of listingsStringDate) {
      listing.leasestartdate = new Date(listing.leasestartdate);
      listings.value.push(listing);
    }
  }
  return { listings, fetchListings }
})

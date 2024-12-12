import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useListingsStore = defineStore('listings', () => {
  const listings = ref([]);
  async function fetchListings() {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/listings`);
    const listingsStringDate = await response.json();
    for (const listing of listingsStringDate) {
      if (listing.leasestartdate) {
        listing.leasestartdate = new Date(listing.leasestartdate);
      }
      listings.value.push(listing);
    }
  }
  return { listings, fetchListings }
})

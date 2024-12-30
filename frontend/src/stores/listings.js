import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiBaseUrl } from '@/config/api';

export const useListingsStore = defineStore('listings', () => {
  const listings = ref([]);
  async function fetchListings() {
    const response = await fetch(`${apiBaseUrl}/listings`);
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

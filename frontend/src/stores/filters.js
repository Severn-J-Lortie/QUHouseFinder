import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('filters', () => {
  const filters = ref([]);
  async function saveFilter(filterObj) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/saveFilter`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({filter: filterObj})
    });
    const result = await resultResponse.json();
    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    filterObj.id = result.id;
    filters.value.push(filterObj);
  }
  async function fetchFilters() {
    const filtersResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/filters`, {
      credentials: 'include'
    });
    const filters = await filtersResponse.json();
    filters.value = filters;
  }
  function getFilter(id) {
    return filters.value.find(filter => filter.id === id);
  }
  function deleteFilter(id) {
    const idxToDelete = filters.value.findIndex(filter => filter.id === id);
    if (idxToDelete > -1) {
      filters.value.splice(idxToDelete, 1);
    }
  }
  return { filters, saveFilter, getFilter, deleteFilter }
});

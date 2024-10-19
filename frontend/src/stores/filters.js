import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('filters', () => {
  const filters = ref([]);
  async function saveFilter(fields) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/saveFilter`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });
    const result = await resultResponse.json();
    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    filters.value.push({ id: result.id, fields });
  }
  async function updateFilter(id, fields) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/updateFilter`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, fields })
    });
    const result = await resultResponse.json();
    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    const filterIdx = filters.value.findIndex(filter => filter.id === id);
    filters.value[filterIdx].fields = fields;
  }
  async function deleteFilter(id) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/deleteFilter`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    const result = await resultResponse.json();
    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    const filterIdx = filters.value.findIndex(f => f.id === id);
    filters.value.splice(filterIdx, 1);
  }
  async function fetchFilters() {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/filters`, {
      credentials: 'include'
    });
    const result = await resultResponse.json();
    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    for (const filter of result.filters) {
      if (filter.fields.leasestartdate.value) {
        filter.fields.leasestartdate.value = new Date(filter.fields.leasestartdate.value);
      }
    }
    filters.value = result.filters;
  }
  return { filters, saveFilter, updateFilter, deleteFilter, fetchFilters }
});

import { ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { FilterMatchMode } from '@primevue/core/api';

export const useFiltersStore = defineStore('filters', () => {
  const filters = ref([]);


  const activeFilter = ref({});

  function resetActiveFilter() {
    activeFilter.value = {
      address: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      beds: { value: null, matchMode: FilterMatchMode.EQUALS },
      priceperbed: { value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
      rentaltype: { value: null, matchMode: FilterMatchMode.EQUALS },
      leasestartdate: { value: null, matchMode: FilterMatchMode.DATE_IS }
    };
  }

  function setActiveFilter(id) {
    const filter = filters.value.find(f => f.id === id);
    activeFilter.value = filter.fields;
  }

  function removeReactivity(object) {
    object = toRaw(object)
    for (const key in object) {
      object[key] = toRaw(object[key]);
    }
    return object;
  }

  async function saveFilter(fields) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/filters/save`, {
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
    filters.value.push({ id: result.id, fields: structuredClone(removeReactivity(fields)) });
  }
  async function updateFilter(id, fields) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/filters/update`, {
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
    filters.value[filterIdx].fields = structuredClone(removeReactivity(fields));
  }
  async function deleteFilter(id) {
    const resultResponse = await fetch(`${import.meta.env.VITE_BACKEND_LOCATION}/filters/delete`, {
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
  return { filters, activeFilter, setActiveFilter, resetActiveFilter, saveFilter, updateFilter, deleteFilter, fetchFilters }
});

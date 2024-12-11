<script setup>
import { ref, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
const { dataType, modelValue } = defineProps({
  dataType: String,
  modelValue: String
});

const localConstraint = ref(modelValue);
watch(() => modelValue, (newValue) => {
  localConstraint.value = newValue;
});
const updateParent = () => {
  emit('update:modelValue', localConstraint.value)
}

const emit = defineEmits(['update:modelValue']);

const filterConstraints = ref({
  string: [
    { label: 'Starts with', matchMode: FilterMatchMode.STARTS_WITH },
    { label: 'Contains', matchMode: FilterMatchMode.CONTAINS },
    { label: 'Not contains', matchMode: FilterMatchMode.NOT_CONTAINS },
    { label: 'Ends with', matchMode: FilterMatchMode.ENDS_WITH },
    { label: 'Equals', matchMode: FilterMatchMode.EQUALS },
    { label: 'Not equals', matchMode: FilterMatchMode.NOT_EQUALS },
    { label: 'No filter', matchMode: null }
  ],
  number: [
    { label: 'Equals', matchMode: FilterMatchMode.EQUALS },
    { label: 'Not equals', matchMode: FilterMatchMode.NOT_EQUALS },
    { label: 'Less than', matchMode: FilterMatchMode.LESS_THAN },
    { label: 'Less than or equal to', matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
    { label: 'Greater than', matchMode: FilterMatchMode.GREATER_THAN },
    { label: 'Greater than or equal to', matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
    { label: 'No filter', matchMode: null }
  ],
  date: [
    { label: 'Date is', matchMode: FilterMatchMode.DATE_IS },
    { label: 'Date is not', matchMode: FilterMatchMode.DATE_IS_NOT },
    { label: 'Date is before', matchMode: FilterMatchMode.DATE_BEFORE },
    { label: 'Date is after', matchMode: FilterMatchMode.DATE_AFTER },
    { label: 'No filter', matchMode: null }
  ]
});

const op = ref();
const toggle = (event) => {
  op.value.toggle(event);
}
</script>

<template>
  <Button icon="pi pi-filter" @click="toggle" text rounded severity="secondary" />
  <Popover ref="op" class="constraints-popover">
    <ul id="constraint-list">
      <li v-for="filterConstraint in filterConstraints[dataType]">
        <Divider v-if="filterConstraint.matchMode === null" class="list-divider" />
        <Button :text="localConstraint !== filterConstraint.matchMode" style="width: 100%; text-align: left"
          @click="localConstraint = filterConstraint.matchMode; updateParent(); toggle()">
          {{ filterConstraint.label }}
        </Button>
      </li>
    </ul>
  </Popover>
</template>

<style scoped>
#constraint-list {
  list-style-type: none;
  padding-left: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
}

#constraint-list {
  text-align: left;
}

.p-popover-content {
  padding: 0px io !important;
}

.list-divider {
  margin-top: 3px;
  margin-bottom: 3px;
}

li .p-button {
  justify-content: flex-start;
  width: 100%;
}
</style>
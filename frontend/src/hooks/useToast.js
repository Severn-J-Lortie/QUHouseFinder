import { useToast as primeVueUseToast} from "primevue/usetoast";

export function useToast() {

  const toast = primeVueUseToast();

  const defaultLifeValue = 3000;
  function add(severity, summary, detail, life) {
    toast.add({ severity, summary, detail, life: life || defaultLifeValue });
  }

  return { add };
}
const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
export const apiBaseUrl = useProxy ? '/api' : import.meta.env.VITE_BACKEND_LOCATION;

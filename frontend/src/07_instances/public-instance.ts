import axios from 'axios';

const publicInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export { publicInstance };

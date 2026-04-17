import axios from 'axios'

// In production the frontend is served from the same origin as the backend,
// OR the backend URL is injected via VITE_API_URL env variable.
const baseURL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL })

// Attach JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

/**
 * Axios instance with automatic JWT injection.
 * Always reads the token fresh from localStorage so stale
 * React state never causes 401 errors.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('mc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    // Surface the real backend error message
    const msg = err.response?.data?.message || err.message || 'Request failed'
    err.displayMessage = msg
    return Promise.reject(err)
  }
)

export default api

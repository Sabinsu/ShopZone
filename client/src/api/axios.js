// client/src/api/axios.js  ← REPLACE existing file
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://shopzone-api.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('shopzone_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
      }
    } catch { /* ignore */ }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.expired) {
      localStorage.removeItem('shopzone_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

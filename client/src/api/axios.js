import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://shopzone-api.onrender.com/api',
})

api.interceptors.request.use(config => {
  try {
    const user = JSON.parse(localStorage.getItem('shopzone_user') || 'null')
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  } catch {}
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shopzone_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

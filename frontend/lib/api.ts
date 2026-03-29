import axios from 'axios'
import { auth } from './auth'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = auth.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) auth.logout()
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────────
export const apiLogin    = (email: string, password: string) =>
  API.post('/auth/login', { email, password })

export const apiRegister = (data: object) =>
  API.post('/auth/register', data)

// ── Patients ─────────────────────────────────────────────────────
export const apiGetPatients   = (params?: object) =>
  API.get('/patients', { params })

export const apiGetPatient    = (id: string) =>
  API.get(`/patients/${id}`)

export const apiCreatePatient = (data: object) =>
  API.post('/patients', data)

export const apiUpdatePatient = (id: string, data: object) =>
  API.put(`/patients/${id}`, data)

export const apiDeletePatient = (id: string) =>
  API.delete(`/patients/${id}`)

// ── Medicines ────────────────────────────────────────────────────
export const apiAddMedicine    = (patientId: string, data: object) =>
  API.post(`/patients/${patientId}/medicines`, data)

export const apiUpdateMedicine = (id: string, data: object) =>
  API.put(`/medicines/${id}`, data)

export const apiDeleteMedicine = (id: string) =>
  API.delete(`/medicines/${id}`)

export const apiRefillMedicine = (id: string) =>
  API.post(`/medicines/${id}/refill`, {})

// ── Reminders ────────────────────────────────────────────────────
export const apiGetReminders = (tab?: string, sort?: string) =>
  API.get('/reminders', { params: { tab, sort } })

export const apiUpdateReminderStatus = (patientId: string, status: string) =>
  API.put(`/reminders/${patientId}`, { status })

// ── Invoices ─────────────────────────────────────────────────────
export const apiGetInvoices   = (params?: object) =>
  API.get('/invoices', { params })

export const apiGetInvoice    = (id: string) =>
  API.get(`/invoices/${id}`)

export const apiCreateInvoice = (data: object) =>
  API.post('/invoices', data)

export const apiUpdateInvoice = (id: string, data: object) =>
  API.put(`/invoices/${id}`, data)

// ── Analytics ────────────────────────────────────────────────────
export const apiGetAnalytics = () =>
  API.get('/analytics')

// ── Settings ─────────────────────────────────────────────────────
export const apiGetSettings    = () =>
  API.get('/settings')

export const apiUpdateSettings = (data: object) =>
  API.put('/settings', data)

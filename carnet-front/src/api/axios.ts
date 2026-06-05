import type { Quote } from '@/models/carnet'
import { type User } from '@/models/user'
import axios, { AxiosError, type AxiosResponse } from 'axios'
import { sendToast } from '@/composables/utils'
import { token } from '@/composables/useAuth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const errorMessage =
      error.response?.data?.message || error.response?.data || error.message || "Erreur de l'API"
    sendToast(errorMessage.detail, 'error')
  } else {
    sendToast("Une erreur inattendue s'est produite", 'error')
  }
  throw error
}

export const quoteService = {
  async createQuote(
    text: string,
    said_by: string,
    label: string,
    instead_of: string,
    type: string,
  ) {
    return api
      .post(
        `/quotes`,
        { text: text, said_by: said_by, label: label, instead_of: instead_of, type: type },
        { headers: { Authorization: `Bearer ${token.value}` } },
      )
      .then((res) => {
        return res.data as Quote
      })
      .catch(handleApiError)
  },
}

export const userService = {
  async listAllQuotes(offset: number) {
    return api
      .get(`/quotes?offset=${offset}`)
      .then((res) => {
        return res.data as Quote[]
      })
      .catch(handleApiError)
  },
  async listAllUser() {
    return api
      .get('/users')
      .then((res) => {
        return res.data as User[]
      })
      .catch(handleApiError)
  },
}

export const authService = {
  async login(data: object): Promise<AxiosResponse> {
    return api
      .post('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .catch(handleApiError)
  },
  async getUserProfile(token: string): Promise<User> {
    try {
      const res = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data as User
    } catch (error) {
      return handleApiError(error) as never
    }
  },
  async changePassword(newPwd: string, confirmNewPwd: string, token: string | null) {
    return api
      .put(
        '/users',
        { new_pwd: newPwd, confirm_new_pwd: confirmNewPwd },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((res) => {
        return res.data as User
      })
      .catch(handleApiError)
  },
}

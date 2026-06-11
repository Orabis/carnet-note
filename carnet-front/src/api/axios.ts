import type { Entry } from '@/models/carnet'
import { type User } from '@/models/user'
import axios, { AxiosError, type AxiosResponse } from 'axios'
import { sendToast } from '@/composables/utils'
import { token } from '@/composables/useAuth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    let msg = "Erreur de l'API"
    if (data) {
      if (typeof data === 'string') {
        msg = data
      } else if (data.detail) {
        if (typeof data.detail === 'string') {
          msg = data.detail
        } else if (Array.isArray(data.detail)) {
          msg = data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ')
        } else {
          msg = JSON.stringify(data.detail)
        }
      } else if (data.message) {
        msg = data.message
      }
    } else {
      msg = error.message || msg
    }
    sendToast(msg, 'error')
  } else {
    sendToast("Une erreur inattendue s'est produite", 'error')
  }
  throw error
}

export const entryService = {
  async createEntry(payload: Partial<Entry>) {
    return api
      .post(
        `/entries`,
        payload,
        { headers: { Authorization: `Bearer ${token.value}` } },
      )
      .then((res) => {
        return res.data as Entry
      })
      .catch(handleApiError)
  },
  async updateEntry(id: number, data: Partial<Entry>) {
    return api
      .put(
        `/entries/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token.value}` } },
      )
      .then((res) => {
        return res.data as Entry
      })
      .catch(handleApiError)
  },
  async deleteEntry(id: number) {
    return api
      .delete(
        `/entries/${id}`,
        { headers: { Authorization: `Bearer ${token.value}` } },
      )
      .then((res) => {
        return res.data
      })
      .catch(handleApiError)
  },
}

export const userService = {
  async listAllEntries(offset: number) {
    return api
      .get(`/entries?offset=${offset}`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      .then((res) => {
        return res.data as Entry[]
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

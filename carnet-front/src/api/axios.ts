import type { Entry } from '@/models/carnet'
import { type User } from '@/models/user'
import axios, { AxiosError, type AxiosResponse } from 'axios'
import { sendToast } from '@/composables/utils'
import { token } from '@/composables/useAuth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Gère et affiche les erreurs retournées par les appels à l'API.
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
  // Crée une nouvelle entrée (décision ou tâche) sur le serveur.
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
  // Met à jour une entrée spécifique (ex: changer son statut) sur le serveur.
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
  // Supprime une entrée existante du serveur.
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
  // Récupère toutes les entrées enregistrées.
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
  // Récupère la liste de tous les utilisateurs du système.
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
  // Authentifie l'utilisateur pour récupérer un jeton JWT.
  async login(data: object): Promise<AxiosResponse> {
    return api
      .post('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .catch(handleApiError)
  },
  // Récupère les informations de profil de l'utilisateur connecté.
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
  // Envoie une demande de modification de mot de passe de l'utilisateur.
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

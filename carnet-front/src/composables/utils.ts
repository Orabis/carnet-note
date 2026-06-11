import moment from 'moment'
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const position = 'top-right'
const duration = 3000

// Affiche une notification toast à l'écran (succès, erreur, info, warning).
export function sendToast(message: string, type: string): void {
  switch (type) {
    case 'success':
      toast.success(message, { position, duration })
      break
    case 'error':
      toast.error(message, { position, duration })
      break
    case 'info':
      toast.info(message, { position, duration })
      break
    case 'warning':
      toast.warning(message, { position, duration })
      break
  }
}

// Formate une date en chaîne lisible au format JJ/MM/AAAA.
export function formatDate(date: string | moment.Moment | null | undefined) {
  if (!date) return ''
  return moment(date).format('DD/MM/YYYY')
}
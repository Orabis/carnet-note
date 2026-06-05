import moment from 'moment'
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const position = 'top-right'
const duration = 3000

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

export function formatDate(date: string | moment.Moment) {
  return moment(date).format('DD/MM/YYYY')
}


export const actionCommentaries = [
  "Comment c'est possible d'être aussi con",
  "IL EST TELLEMENT DEBILE FAUT CREVER ENFOIRE DE MEEEEEEEERDE!!!!!!!!!",
  "Fils de pute",
]
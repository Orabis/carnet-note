import type { Moment } from "moment"

export class Quote {
    id: number = 0
    text: string = ''
    said_by: string = ''
    date_added: string | Moment = ''
    type: string = 'CITATION'
    instead_of: string = ''
    label: string = ''
}
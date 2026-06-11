import type { Moment } from "moment"

export type EntryStatus = "À faire" | "En cours" | "Terminée" | "Bloquée";
export type EntryPriority = "Faible" | "Moyenne" | "Haute";

export class Entry {
    id: number = 0
    text: string = ''
    said_by: string = ''
    date_added: string | Moment = ''
    type: 'DECISION' | 'TACHE' = 'DECISION'
    label: string = ''
    status: EntryStatus = "À faire"
    priority: EntryPriority = "Moyenne"
    due_date: string | Moment | null = null
}

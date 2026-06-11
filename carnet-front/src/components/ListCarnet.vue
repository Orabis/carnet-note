<script setup lang="ts">
import { formatDate } from '@/composables/utils'
import type { Entry } from '@/models/carnet'
import { computed } from 'vue'

const props = defineProps<{ entries: Entry[] }>()

const emit = defineEmits<{
  (e: 'update-entry', entryId: number, data: Partial<Entry>): void
  (e: 'delete-entry', entryId: number): void
}>()

// Calcule l'espace vide nécessaire pour aligner proprement la grille.
const emptySpace = computed(() => {
  const largeEntries = props.entries?.filter((entry) => entry.text.length < 15) || []
  return 3 - ((largeEntries.length % 3) % 3)
})

// Détermine la largeur d'une carte (1 ou 2 colonnes) selon la longueur du texte.
const getSpanClass = (entry: Entry) => {
  const length = entry.text.length
  if (length >= 15) return 'span-2'
  return 'span-1'
}

// Retourne la classe CSS correspondant à la sévérité de la priorité.
const getPriorityClass = (priority: string) => {
  if (priority === 'Haute') return 'priority-high'
  if (priority === 'Moyenne') return 'priority-medium'
  return 'priority-low'
}

// Indique si la tâche est en retard par rapport à sa date d'échéance.
const isOverdue = (entry: Entry) => {
  if (!entry.due_date || entry.status === 'Terminée') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(entry.due_date as string)
  return dueDate < today
}

// Émet un événement pour notifier le parent qu'un statut de tâche a changé.
function changeStatus(entry: Entry, event: Event) {
  const selectEl = event.target as HTMLSelectElement
  emit('update-entry', entry.id, { status: selectEl.value as any })
}

// Émet un événement pour notifier le parent qu'une entrée doit être supprimée.
function deleteEntry(entryId: number) {
  emit('delete-entry', entryId)
}
</script>

<template>
  <div class="list-carnet-grid">
    <article
      v-for="entry in entries"
      :key="entry.id"
      :class="[
        getSpanClass(entry),
        entry.type === 'TACHE' ? 'task-card' : 'decision-card',
        entry.status === 'Terminée' ? 'task-done' : ''
      ]"
    >
      <header class="card-header">
        <span class="type-badge" :class="entry.type.toLowerCase()">
          {{ entry.type === 'DECISION' ? 'Décision' : 'Tâche' }}
        </span>
        <button class="delete-btn" title="Supprimer l'entrée" @click="deleteEntry(entry.id)">
          &times;
        </button>
      </header>
      <blockquote>
        <div class="quote-container">
          <span v-if="entry.type === 'DECISION'" class="quote-mark" aria-hidden="true">«</span>
          <p class="quote-text">{{ entry.text }}</p>
          <span v-if="entry.type === 'DECISION'" class="quote-mark" aria-hidden="true">»</span>
        </div>
      </blockquote>

      <!-- Task specifics -->
      <div v-if="entry.type === 'TACHE'" class="task-details">
        <div class="detail-row">
          <span class="detail-label">Priorité :</span>
          <span class="priority-badge" :class="getPriorityClass(entry.priority)">
            {{ entry.priority }}
          </span>
        </div>
        <div v-if="entry.due_date" class="detail-row">
          <span class="detail-label">Échéance :</span>
          <span class="due-date" :class="isOverdue(entry) ? 'overdue' : ''">
            {{ formatDate(entry.due_date) }}
            <span v-if="isOverdue(entry)" class="overdue-tag">En retard</span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Statut :</span>
          <select :value="entry.status" @change="changeStatus(entry, $event)" class="status-select">
            <option value="À faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminée</option>
            <option value="Bloquée">Bloquée</option>
          </select>
        </div>
      </div>

      <footer>
        <p>
          Assigné à <span class="author-name">{{ entry.said_by.toUpperCase() }}</span> le
          <span class="author-name">{{ formatDate(entry.date_added) }} </span>
        </p>
        <span class="badge">{{ entry.label }}</span>
      </footer>
    </article>
    <div class="empty-article" v-for="e in emptySpace" :key="'empty-' + e" />
  </div>
</template>

<style scoped>
.list-carnet-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: stretch;
  grid-auto-flow: dense;
  width: 100%;
}
@media (max-width: 900px) {
  .list-carnet-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 550px) {
  .list-carnet-grid {
    display: flex;
    flex-direction: column;
  }
}

.list-carnet-grid > .empty-article {
  background-color: var(--color-bg-deactivate);
  border: 1px solid var(--obsidian-700);
  border-radius: 12px;
  min-height: 150px;
}

article {
  position: relative;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--obsidian-700);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  justify-content: space-between;
  grid-column: span 1;
}

article:hover {
  border-color: var(--color-accent);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(147, 51, 234, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.type-badge.decision {
  background-color: rgba(147, 51, 234, 0.15);
  color: var(--purple-300);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.type-badge.tache {
  background-color: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s, transform 0.2s;
  margin: 0;
}

.delete-btn:hover {
  color: #f87171;
  transform: scale(1.2);
}

blockquote {
  margin: 0 0 1rem 0;
}

.quote-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: auto 0;
}

.quote-mark {
  color: var(--color-accent);
  font-size: 1.8rem;
  font-family: serif;
  line-height: 1;
  font-weight: bold;
}

.quote-text {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  text-align: center;
  overflow-wrap: break-word;
  min-width: 0;
}

/* Task styling and interactive features */
.task-details {
  background-color: var(--obsidian-900);
  border: 1px solid var(--obsidian-700);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.detail-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.priority-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.priority-high {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.priority-medium {
  background-color: rgba(245, 158, 11, 0.2);
  color: #fde047;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.priority-low {
  background-color: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.due-date {
  color: var(--color-text-primary);
  font-weight: 500;
}

.due-date.overdue {
  color: #f87171;
}

.overdue-tag {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 0.65rem;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 4px;
  font-weight: 700;
}

.status-select {
  background-color: var(--obsidian-800);
  border: 1px solid var(--obsidian-700);
  color: var(--color-text-primary);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.status-select:focus {
  border-color: var(--color-accent);
}

/* Visual done status */
.task-done {
  border-color: rgba(16, 185, 129, 0.4);
  background-color: rgba(16, 185, 129, 0.02);
}

.task-done .quote-text {
  text-decoration: line-through;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--obsidian-700);
}

footer > p {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
}

footer .author-name {
  color: var(--text-white);
  font-weight: 600;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: rgba(126, 34, 206, 0.2);
  color: var(--purple-300);
  border: 1px solid rgba(126, 34, 206, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.span-1 {
  grid-column: span 1;
}

.span-2 {
  grid-column: span 2;
}
</style>

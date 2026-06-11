<script setup lang="ts">
import { entryService, userService } from '@/api/axios'
import ListCarnet from '@/components/ListCarnet.vue'
import { sendToast } from '@/composables/utils'
import { Entry, EntryPriority } from '@/models/carnet'
import type { User } from '@/models/user'
import moment from 'moment'
import { computed, onMounted, ref } from 'vue'
const dialogRef = ref<HTMLDialogElement | null>(null)

const selectedType = ref<string>('DECISION')
const newText = ref<string>('')
const newAuthor = ref<string>('')
const newLabel = ref<string>('')
const newPriority = ref<EntryPriority>('Moyenne')
const newDueDate = ref<string>('')

const entries = ref<Entry[]>([])
const users = ref<User[]>([])

const filterText = ref<string>('')
const filterLabels = ref<string>('')
const filterName = ref<string>('all')
const triDate = ref<string>('↑')

const filteredEntries = computed(() => {
  const text = filterText.value.toLowerCase()
  const name = filterName.value.toLowerCase()
  const label = filterLabels.value.toLowerCase()

  return entries.value.filter((entry) => {
    const textMatch = entry.text.toLowerCase().includes(text)
    const nameMatch = name === 'all' || (entry.said_by || '').toLowerCase().includes(name)
    const labelMatch = (entry.label || '').toLowerCase().includes(label)
    return textMatch && nameMatch && labelMatch
  })
})

onMounted(async () => {
  entries.value = await userService.listAllEntries(0)
  users.value = await userService.listAllUser()
  if (users.value.length && users.value[0]?.username) {
    newAuthor.value = users.value[0].username
  }
  entries.value.map((q) => moment(q.date_added))
  sortQuotes(false)
})

// Trie les entrées par ordre chronologique (croissant ou décroissant).
function sortQuotes(asc: boolean) {
  entries.value.sort((a, b) => {
    if (a.date_added < b.date_added) {
      return asc ? -1 : 1
    } else if (a.date_added > b.date_added) {
      return asc ? 1 : -1
    }
    return 0
  })
}

// Alterne l'ordre de tri chronologique des entrées.
function changeSortOrder() {
  if (triDate.value === '↓') {
    triDate.value = '↑'
    sortQuotes(false)
  } else {
    sortQuotes(true)
    triDate.value = '↓'
  }
}

// Ouvre la boîte de dialogue de création d'une nouvelle entrée.
const showDialog = () => {
  dialogRef.value?.showModal()
}
// Ferme la boîte de dialogue de création d'une nouvelle entrée.
const closeDialog = () => {
  dialogRef.value?.close()
}

// Envoie la nouvelle entrée créée à l'API et l'ajoute à la liste locale.
async function createEntry() {
  let createdEntry: Entry
  try {
    const payload: Partial<Entry> = {
      text: newText.value,
      said_by: newAuthor.value,
      label: newLabel.value,
      type: selectedType.value === 'DECISION' ? 'DECISION' : 'TACHE',
    }

    if (payload.type === 'TACHE') {
      payload.priority = newPriority.value
      payload.due_date = newDueDate.value || null
      payload.status = 'À faire'
    }

    createdEntry = await entryService.createEntry(payload)
    entries.value.push(createdEntry)
    sendToast('Entrée créée avec succès', 'success')
    sortQuotes(triDate.value !== '↓')
    closeDialog()
  } catch (err) {
    console.error(err)
  }
}

// Appelle l'API de modification d'entrée et met à jour l'état local.
async function handleUpdateEntry(id: number, data: Partial<Entry>) {
  try {
    const updated = await entryService.updateEntry(id, data)
    const index = entries.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      entries.value[index] = updated
    }
    sendToast('Entrée mise à jour avec succès', 'success')
  } catch (err) {
    console.error(err)
  }
}

// Appelle l'API de suppression d'entrée et la retire de l'état local.
async function handleDeleteEntry(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
    try {
      await entryService.deleteEntry(id)
      entries.value = entries.value.filter((e) => e.id !== id)
      sendToast('Entrée supprimée avec succès', 'success')
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<template>
  <div>
    <h2>Registre des Entrées :</h2>
    <div class="filter-section">
      <label
        >Filtrer par collaborateur :
        <select v-model="filterName" name="filter-name" id="filter-name">
          <option value="all">TOUS</option>
          <option v-for="user in users" :key="user.username" :value="user.username">
            {{ user.username.toUpperCase() }}
          </option>
        </select>
      </label>
      <label
        >Filtrer par contenu :
        <input v-model="filterText" type="text" placeholder="Recherche..." />
      </label>
      <label
        >Filtrer par catégorie :
        <input v-model="filterLabels" type="text" placeholder="API, UI, ..." />
      </label>
      <button @click="changeSortOrder">Tri par date {{ triDate }}</button>
    </div>
    <button @click="showDialog">+ Nouvelle Entrée</button>
  </div>
  <ListCarnet
    :entries="filteredEntries"
    @update-entry="handleUpdateEntry"
    @delete-entry="handleDeleteEntry"
  />
  <dialog ref="dialogRef">
    <form @submit.prevent="createEntry">
      <h2>Nouvelle Entrée</h2>
      <div class="input">
        <label>Type d'entrée : </label>
        <select v-model="selectedType">
          <option value="DECISION">DECISION</option>
          <option value="TACHE">TACHE</option>
        </select>
      </div>
      <div class="input">
        <label>{{ selectedType === "DECISION" ? "Décision/Note" : "Tâche" }} : </label>
        <input v-model="newText" type="text" id="create-quote" required />
      </div>
      <div v-if="selectedType === 'TACHE'" class="input-group">
        <div class="input">
          <label>Priorité :</label>
          <select v-model="newPriority">
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
          </select>
        </div>
        <div class="input">
          <label>Date d'échéance :</label>
          <input v-model="newDueDate" type="date" />
        </div>
      </div>
      <div class="input">
        <label> Collaborateur assigné : </label>
        <select v-model="newAuthor">
          <option v-for="user in users" :key="user.id" :value="user.username">
            {{ user.username.toUpperCase() }}
          </option>
        </select>
      </div>
      <div class="input">
        <label> Catégorie : </label>
        <input v-model="newLabel" type="text" id="create-label" required />
      </div>
      <div>
        <button type="submit">Ajouter</button>
        <button type="button" id="cancel" @click="closeDialog">Annuler</button>
      </div>
    </form>
  </dialog>
</template>
<style scoped>
.input-group {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}
.input-group > .input {
  flex: 1;
}
main {
  > div {
    width: 100%;
    max-width: 1200px;
    margin: 1rem 0;

    &:first-child {
      display: flex;
      gap: 1.5rem;
      flex-direction: column;
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--obsidian-700);
      border-radius: 12px;
      padding: 1.5rem;
    }
  }
}

.filter-section {
  display: flex;
  align-items: flex-end;
  flex-direction: row;
  justify-content: space-between;
  gap: 1.5rem;
  > button {
    margin: 0;
  }
  > label {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.5rem;
    font-size: 0.95rem;
    > input,
    select {
      border-radius: 8px;
      border: 1px solid var(--obsidian-700);
      color: var(--text-white, #fff);
    }
  }
}
@media (max-width: 450px) {
  h2 {
    text-align: center;
  }
  .filter-section {
    align-items: center;
    flex-direction: column;

    > label {
      align-items: center;
    }
  }

}

dialog {
  > form {
    display: flex;
    gap: 2rem;
    flex-direction: column;
    justify-content: space-evenly;
  }

  h2 {
    text-align: center;
  }

  div.input {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: stretch;
  }

  div {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: stretch;

    > button {
      width: 45%;
    }
  }
}
</style>

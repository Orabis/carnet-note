<script setup lang="ts">
import { quoteService, userService } from '@/api/axios'
import ListCarnet from '@/components/ListCarnet.vue'
import { sendToast } from '@/composables/utils'
import { Quote } from '@/models/carnet'
import type { User } from '@/models/user'
import moment from 'moment'
import { computed, onMounted, ref } from 'vue'
const dialogRef = ref<HTMLDialogElement | null>(null)

const selectedType = ref<string>('CITATION')
const newQuote = ref<string>('')
const newInsteadOf = ref<string>('')
const newAuthor = ref<string>('')
const newLabel = ref<string>('')
const quotes = ref<Quote[]>([])
const users = ref<User[]>([])

const filterText = ref<string>('')
const filterLabels = ref<string>('')
const filterName = ref<string>('all')
const triDate = ref<string>('↑')

const filterQuotes = computed(() => {
  const text = filterText.value.toLowerCase()
  const name = filterName.value.toLowerCase()
  const label = filterLabels.value.toLowerCase()

  return quotes.value.filter((quote) => {
    const textMatch = quote.text.toLowerCase().includes(text)
    const nameMatch = name === 'all' || (quote.said_by || '').toLowerCase().includes(name)
    const labelMatch = (quote.label || '').toLowerCase().includes(label)
    return textMatch && nameMatch && labelMatch
  })
})

onMounted(async () => {
  quotes.value = await userService.listAllQuotes(0)
  users.value = await userService.listAllUser()
  if (users.value.length && users.value[0]?.username) {
    newAuthor.value = users.value[0].username
  }
  quotes.value.map((q) => moment(q.date_added))
  sortQuotes(false)
})

function sortQuotes(asc: boolean) {
  quotes.value.sort((a, b) => {
    if (a.date_added < b.date_added) {
      return asc ? -1 : 1
    } else if (a.date_added > b.date_added) {
      return asc ? 1 : -1
    }
    return 0
  })
}

function changeSortOrder() {
  if (triDate.value === '↓') {
    triDate.value = '↑'
    sortQuotes(false)
  } else {
    sortQuotes(true)
    triDate.value = '↓'
  }
}

const showDialog = () => {
  dialogRef.value?.showModal()
}
const closeDialog = () => {
  dialogRef.value?.close()
}

async function createQuote() {
  let createdQuote: Quote
  try {
    createdQuote = await quoteService.createQuote(
      newQuote.value,
      newAuthor.value,
      newLabel.value,
      selectedType.value === "CITATION" ? newInsteadOf.value : "",
      selectedType.value
    )
    quotes.value.push(createdQuote)
    sendToast('Carnet créé avec succès', 'success')
    sortQuotes(triDate.value !== '↓')
    closeDialog()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>
    <h2>Liste des carnets :</h2>
    <div class="filter-section">
      <label
        >Filtrer par nom :
        <select v-model="filterName" name="filter-name" id="filter-name">
          <option value="all">TOUS</option>
          <option v-for="user in users" :key="user.username" :value="user.username">
            {{ user.username.toUpperCase() }}
          </option>
        </select>
      </label>
      <label
        >Filtrer par carnet :
        <input v-model="filterText" type="text" placeholder="Lapin contre crétin..." />
      </label>
      <label
        >Filtrer par tags :
        <input v-model="filterLabels" type="text" placeholder="C'est chaud" />
      </label>
      <button @click="changeSortOrder">Tri par date {{ triDate }}</button>
    </div>
    <button @click="showDialog">+ Crée un Carnet</button>
  </div>
  <ListCarnet :quotes="filterQuotes" />
  <dialog ref="dialogRef">
    <form @submit.prevent="createQuote">
      <h2>Nouveau carnet</h2>
      <div class="input">
        <label>Le carnet décrit-il une action ou une citation : </label>
        <select v-model="selectedType">
          <option value="CITATION">CITATION</option>
          <option value="ACTION">ACTION</option>
        </select>
      </div>
      <div class="input">
        <label>{{ selectedType === "CITATION" ? "Citation" : "Action" }} : </label>
        <input v-model="newQuote" type="text" id="create-quote" required />
      </div>
      <div v-if="selectedType==='CITATION'" class="input">
        <label>{{ newQuote !== '' ? `« ${newQuote} »` : '' }} à la place de :</label>
        <input v-model="newInsteadOf" type="text" id="create-author" required />
      </div>
      <div class="input">
        <label> Le débile concerné : </label>
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

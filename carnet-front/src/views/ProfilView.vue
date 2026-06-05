<script setup lang="ts">
import { authService } from '@/api/axios'
import ListCarnet from '@/components/ListCarnet.vue'
import { useAuth } from '@/composables/useAuth'
import { sendToast } from '@/composables/utils'
import type { User } from '@/models/user'
import { onMounted, ref, type Ref } from 'vue'
const { token } = useAuth()
const axiosClient = authService

const { changePassword } = useAuth()

const me: Ref<User | undefined> = ref(undefined)

const newPwd = ref<string>('')
const confirmNewPwd = ref<string>('')

//faut refacto ca c pas beau parceque y'aura de la redondance
// cmt on fait alors wallah ?
onMounted(async () => {
  if (token.value) {
    me.value = await axiosClient.getUserProfile(token.value)
  }
})

async function handleChangePassword() {
  try {
    await changePassword(newPwd.value, confirmNewPwd.value)
    sendToast('Mot de passe changé avec succès', 'success')
    newPwd.value = ''
    confirmNewPwd.value = ''
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="change-pwd">
    <form @submit.prevent="handleChangePassword">
      <h2>Changer le mot de passe de {{ me?.username }}</h2>
      <div class="input">
        <label>Nouveau mot de passe</label>
        <input v-model="newPwd" type="password" />
      </div>
      <div class="input">
        <label>Répéter le nouveau mot de passe</label>
        <input v-model="confirmNewPwd" type="password" />
      </div>
      <button type="submit">Changer le mot de passe</button>
    </form>
  </div>
</template>

<style scoped>


form {
  display: flex;
  flex-direction: column;
  h2 {
    text-align: center;
    margin-bottom: 4rem;
  }

  div.input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    justify-content: center;
    flex-direction: column;
    align-items: stretch;
  }
}

main {
  > div {
    width: 100%;
    max-width: 600px;
    margin: 1rem 0;

    &:first-child {
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--obsidian-700);
      border-radius: 12px;
      padding: 1.5rem;
    }
  }
}
</style>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth.ts'
import { useRouter } from 'vue-router'
import { sendToast } from '@/composables/utils.ts'

const { isAuthenticated, logout } = useAuth()
const router = useRouter()

function handleLogout() {
  router.push('login')
  sendToast('Vous êtes maintenant déconnecté', 'info')
  logout()
}
</script>

<template>
  <nav>
    <h1 class="nav-title">Le Véritable Carnet</h1>
    <div class="nav-links">
      <RouterLink v-show="isAuthenticated" to="/">Accueil</RouterLink>
      <RouterLink v-show="!isAuthenticated" to="/login">Se connecter</RouterLink>
      <RouterLink v-show="isAuthenticated" to="/profil">Profil</RouterLink>
      <a v-on:click.prevent="handleLogout" href="#" v-show="isAuthenticated">Se déconnecter</a>
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Aligne le titre à gauche et les liens à droite */
  padding: 1rem;
  gap: 1rem;

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap; /* Permet aux liens de passer à la ligne si vraiment trop petit */

    > a {
      text-decoration: none;
      color: white;
      white-space: nowrap; /* Évite qu'un lien se coupe en deux */

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 450px) {
  .nav-title {
    display: none;
  }

  nav {
    justify-content: center;
  }
}
</style>

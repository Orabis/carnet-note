<script setup lang="ts">
import { actionCommentaries, formatDate } from '@/composables/utils'
import type { Quote } from '@/models/carnet'
import { computed } from 'vue'

const props = defineProps<{ quotes: Quote[] }>()

const emptySpace = computed(() => {
  const largeQuote = props.quotes?.filter((carnet) => carnet.text.length < 15) || []
  return 3 - ((largeQuote.length % 3) % 3)
})

const getSpanClass = (quote: Quote) => {
  const length = quote.text.length
  if (length >= 15) return 'span-2'
  return 'span-1'
}
</script>

<template>
  <div class="list-carnet-grid">
    <article v-for="quote in quotes" :key="quote.id" :class="getSpanClass(quote)">
      <!-- TYPE = CITATION -->
      <blockquote v-if="quote.type === 'CITATION'">
        <div class="quote-container">
          <span class="quote-mark" aria-hidden="true">«</span>
          <p class="quote-text">{{ quote.text }}</p>
          <span class="quote-mark" aria-hidden="true">»</span>
        </div>

        <p class="replacement-clause">
          <span class="label">à la place de</span>
          <cite class="placeholder-text">« {{ quote.instead_of }} »</cite>
        </p>
      </blockquote>
      <!-- TYPE = ACTION -->
       <blockquote v-if="quote.type === 'ACTION'">
        <div class="quote-container">
          <p class="quote-text">{{ quote.text }}</p>
        </div>
        <p class="replacement-clause">
          <span class="label">{{ actionCommentaries[Math.floor(Math.random() * actionCommentaries.length)] }}</span>
        </p>
       </blockquote>
      <footer>
        <p>
          {{ quote.type === "CITATION" ? "carnet dit par" : "carnet fait par" }} <span class="author-name">{{ quote.said_by.toUpperCase() }}</span> le
          <span class="author-name">{{ formatDate(quote.date_added) }} </span>
        </p>
        <span class="badge">{{ quote.label }}</span>
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
@media (max-width: 450px) {
  .list-carnet-grid {
    display: flex;
    flex-direction: column;
  }

}

.list-carnet-grid > .empty-article {
  background-color: var(--color-bg-deactivate);
  border: 1px solid var(--obsidian-700);
  border-radius: 12px;
}

article {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--obsidian-700);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  justify-content: space-evenly;
  grid-column: span 1;

  &:hover {
    border-color: var(--color-accent);
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 25px rgba(147, 51, 234, 0.15);
  }
  > blockquote {
    margin: 0 1.5rem;
  }
  > footer {
    padding-bottom: 0;
  }
  .quote-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin: auto 0;

    .quote-mark {
      color: var(--color-accent);
      font-size: 1.8rem;
      font-family: serif;
      line-height: 1;
      font-weight: bold;
    }

    .quote-text {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.4;
      text-align: center;
      overflow-wrap: break-word;
      min-width: 0;
    }
  }

  .replacement-clause {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-width: 0;

    .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--purple-400);
      font-weight: 700;
    }

    .placeholder-text {
      color: var(--color-text-secondary);
      font-style: italic;
      font-size: 1rem;
      width: 100%;
      text-align: center;
      overflow-wrap: break-word;
      word-wrap: break-word;
      min-width: 0;
    }
  }

  > footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid var(--obsidian-700);

    > p {
      font-size: 0.9rem;
      color: var(--color-text-secondary);

      .author-name {
        color: var(--text-white);
        font-weight: 600;
      }
    }

    .badge {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      background-color: var(--badge-background-color);
      color: var(--badge-color);
      border: 2px solid #800000;
      text-transform: uppercase;
    }
  }
}
.span-1 {
  grid-column: span 1;
}
.span-2 {
  grid-column: span 3;
}
</style>

<script lang="ts">
  import { fade } from 'svelte/transition';

  export let env: string;

  let visible = true;
</script>

{#if visible}
  <div class="absolute bottom-5 right-5 z-50 pointer-events-none" transition:fade>
    <div
      class="pointer-events-auto flex items-center justify-between gap-x-6 bg-primary-700 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5"
    >
      <p class="text-sm leading-6 text-white">
        <strong class="font-semibold">Environnement : </strong>
        <span>{env}</span>
      </p>
      <button
        type="button"
        class="-m-1.5 flex-none p-1.5"
        on:click={() => {
          visible = false;
        }}
      >
        <span class="sr-only">Fermer</span>
        <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}

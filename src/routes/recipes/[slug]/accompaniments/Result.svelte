<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade, type FadeParams } from 'svelte/transition';

  import { prefersReducedMotion } from '$lib/utils/preferences';

  export let dish: string;
  export let accompaniments: string[] = [];

  const fadeParams: FadeParams = {
    duration: prefersReducedMotion() ? 0 : 300,
    easing: cubicOut,
  };
</script>

{#if accompaniments.length > 0}
  <p class="sr-only" role="status">
    {accompaniments.length} accompagnement{accompaniments.length > 1 ? 's' : ''} trouvé{accompaniments.length >
    1
      ? 's'
      : ''} pour "{dish}".
  </p>
  <ol
    class="space-y-1 text-gray-500 list-decimal list-inside w-fit mx-auto"
    transition:fade={fadeParams}
  >
    {#each accompaniments as accompaniment}
      <li>
        <span class="text-gray-900">{accompaniment}</span>
      </li>
    {/each}
  </ol>
{:else}
  <p class="text-gray-500 text-center" role="status" transition:fade={fadeParams}>
    Aucun accompagnement trouvé pour "{dish}".
  </p>
{/if}

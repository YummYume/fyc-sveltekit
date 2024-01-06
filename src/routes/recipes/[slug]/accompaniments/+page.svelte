<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade, type FadeParams } from 'svelte/transition';

  import Loader from '$lib/components/Loader.svelte';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  import type { PageData } from './$types';

  export let data: PageData;

  const fadeParams: FadeParams = {
    duration: prefersReducedMotion() ? 0 : 300,
    easing: cubicOut,
  };
</script>

<h1 class="h1">{data.recipe.dish}</h1>

<section class="container mx-auto space-y-4">
  <h2 class="h2 text-center">Accompagnements personnalisés</h2>

  {#await data.accompaniments}
    <Loader message="Chargement des accompagnements..." />
  {:then accompaniments}
    {#if accompaniments.length > 0}
      <p class="sr-only" role="status">
        {accompaniments.length} accompagnement{accompaniments.length > 1 ? 's' : ''} trouvé{accompaniments.length >
        1
          ? 's'
          : ''} pour "{data.recipe.dish}".
      </p>
      <ol class="space-y-1 text-gray-500 list-decimal list-inside w-fit mx-auto">
        {#each accompaniments as accompaniment}
          <li>
            <span class="text-gray-900">{accompaniment}</span>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="text-gray-500 text-center" role="status">
        Aucun accompagnement trouvé pour "{data.recipe.dish}".
      </p>
    {/if}
  {:catch}
    <p class="text-red-500 text-center" role="status" transition:fade={fadeParams}>
      Une erreur est survenue lors du chargement des accompagnements. Veuillez réessayer plus tard.
    </p>
  {/await}

  <a href="/recipes/{data.recipe.slug}" class="btn">Retour à la recette</a>
</section>

<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade, type FadeParams } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { truncate } from '$lib/utils/string';

  import type { PageData } from './$types';

  export let dish: string;
  export let similarRecipes: Awaited<PageData['similarRecipes']> = [];

  const fadeParams: FadeParams = {
    duration: prefersReducedMotion() ? 0 : 300,
    easing: cubicOut,
  };
</script>

{#if similarRecipes.length > 0}
  <p class="sr-only" role="status">
    {similarRecipes.length} recette{similarRecipes.length > 1 ? 's' : ''} similaire{similarRecipes.length >
    1
      ? 's'
      : ''} trouvée{similarRecipes.length > 1 ? 's' : ''} pour "{dish}".
  </p>
  <ul class="flex flex-col justify-center mx-auto gap-2" transition:fade={fadeParams}>
    {#each similarRecipes as similarRecipe}
      <li>
        <Card>
          <div class="flex-grow flex flex-col gap-1">
            <a
              href="/recipes/{similarRecipe.slug}"
              class="hover:text-primary-600 focus-visible:text-primary-600 transition-colors motion-reduce:transition-none"
            >
              <h3 class="h3">
                {similarRecipe.dish}
              </h3>
            </a>
            <p class="text-gray-600">{truncate(similarRecipe.description, 100)}</p>
          </div>
        </Card>
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-gray-500 text-center" role="status" transition:fade={fadeParams}>
    Aucune recette similaire trouvée pour "{dish}".
  </p>
{/if}

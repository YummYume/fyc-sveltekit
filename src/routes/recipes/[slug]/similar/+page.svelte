<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { truncate } from '$lib/utils/string';

  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1 class="h1">{data.recipe.dish}</h1>

<section class="container mx-auto space-y-4">
  <h2 class="h2 text-center">Recettes similaires</h2>

  {#if data.similarRecipes.length > 0}
    <p class="sr-only" role="status">
      {data.similarRecipes.length} recette{data.similarRecipes.length > 1 ? 's' : ''} similaire{data
        .similarRecipes.length > 1
        ? 's'
        : ''} trouvée{data.similarRecipes.length > 1 ? 's' : ''} pour "{data.recipe.dish}".
    </p>
    <ul class="flex flex-col justify-center mx-auto gap-2">
      {#each data.similarRecipes as similarRecipe}
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
    <p class="text-gray-500 text-center" role="status">
      Aucune recette similaire trouvée pour "{data.recipe.dish}".
    </p>
  {/if}
</section>

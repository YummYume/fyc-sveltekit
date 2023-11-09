<script lang="ts">
  import { enhance } from '$app/forms';
  import Loader from '$lib/components/Loader.svelte';
  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import StarFull from '$lib/svg/StarFull.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

{#await data.streamed.result}
  <Loader />
{:then value}
  <div class="flex gap-2 items-center justify-center">
    <h1 class="h1 first-letter:capitalize">{value.recipe.dish}</h1>
    <form
      method="POST"
      action="?/favourite"
      aria-label="Ajouter la recette aux favoris"
      use:enhance
    >
      <input type="number" name="recipe" value={value.recipe.id} class="hidden" />

      {#if value.isFavourite}
        <button aria-label="Retirer la recette des favoris" type="submit">
          <StarFull />
        </button>
      {:else}
        <button aria-label="Ajouter la recette aux favoris" type="submit">
          <StarEmpty />
        </button>
      {/if}
    </form>
  </div>
  <div class="container mx-auto">
    <p class="mb-3 text-lg text-gray-500 text-center md:text-xl">{value.recipe.description}</p>
    <div class="grid gap-6 sm:grid-cols-2">
      <div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900">Ingrédients nécessaires</h2>
        <ol class="space-y-1 text-gray-500 list-decimal list-inside">
          {#if Array.isArray(value.recipe.ingredients)}
            {#each value.recipe.ingredients as ingredient}
              <li>
                <span class="text-gray-900">{ingredient}</span>
              </li>
            {/each}
          {/if}
        </ol>
      </div>
      <div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900">Etapes de la recette</h2>
        <ol class="space-y-1 text-gray-500 list-decimal list-inside">
          {#if Array.isArray(value.recipe.steps)}
            {#each value.recipe.steps as step}
              <li>
                <span class="text-gray-900">{step}</span>
              </li>
            {/each}
          {/if}
        </ol>
      </div>
    </div>
  </div>
{/await}

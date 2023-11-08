<script lang="ts">
  import { enhance } from '$app/forms';
  import Loader from '$lib/components/Loader.svelte';
  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

{#await data.streamed.recipe}
  <Loader />
{:then value}
  {#if value}
    <div class="flex gap-2 items-center justify-center">
      <h1 class="h1 first-letter:capitalize">{value.dish}</h1>
      <form method="POST" action="?/favourite" aria-label="Ajouter la recette aux favoris">
        <input type="text" name="recipe" {value} class="hidden" />
        <button aria-label="Ajouter la recette aux favoris" type="submit">
          <StarEmpty />
        </button>
      </form>
    </div>
    <div class="container mx-auto">
      <p class="mb-3 text-lg text-gray-500 text-center md:text-xl">{value.description}</p>
      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 class="mb-2 text-lg font-semibold text-gray-900">Ingrédients nécessaires</h2>
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#if Array.isArray(value.ingredients)}
              {#each value.ingredients as ingredient}
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
            {#if Array.isArray(value.steps)}
              {#each value.steps as step}
                <li>
                  <span class="text-gray-900">{step}</span>
                </li>
              {/each}
            {/if}
          </ol>
        </div>
      </div>
    </div>
  {:else}
    <p class="h2">404</p>
  {/if}
{/await}

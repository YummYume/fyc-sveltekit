<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { crossfade } from 'svelte/transition';

  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import StarFull from '$lib/svg/StarFull.svelte';

  import type { ActionData, PageData } from './$types';

  import { enhance } from '$app/forms';

  export let data: PageData;

  export let form: ActionData;

  $: starKey = data.isFavourite ? 'full' : 'empty';

  const [send, receive] = crossfade({
    duration: 700,
    easing: quintOut,
  });
</script>

<svelte:head>
  <title>{data.recipe.dish}</title>
  <meta name="description" content={data.recipe.description} />
</svelte:head>

<div class="flex gap-2 items-center justify-center">
  <form method="POST" action="?/favourite" class="relative" use:enhance>
    <h1 class="h1 first-letter:capitalize">{data.recipe.dish}</h1>
    <input type="hidden" name="recipe" value={data.recipe.id} class="hidden" />
    <button
      aria-label={data.isFavourite
        ? 'Retirer la recette des favoris'
        : 'Ajouter la recette aux favoris'}
      type="submit"
    >
      {#if data.isFavourite}
        <span
          class="absolute right-0 top-0 translate-x-full"
          in:send={{ key: starKey }}
          out:receive={{ key: starKey }}
        >
          <StarFull />
        </span>
      {:else}
        <span
          class="absolute right-0 top-0 translate-x-full"
          in:send={{ key: starKey }}
          out:receive={{ key: starKey }}
        >
          <StarEmpty />
        </span>
      {/if}
    </button>
  </form>
</div>
<div class="container mx-auto">
  {#if form?.error}
    <p class="text-sm font-light text-red-600">{form.error}</p>
  {/if}

  <p class="mb-3 text-lg text-gray-500 text-center md:text-xl">{data.recipe.description}</p>
  <div class="grid gap-6 sm:grid-cols-2">
    <div>
      <h2 class="mb-2 text-lg font-semibold text-gray-900">Ingrédients nécessaires</h2>
      <ol class="space-y-1 text-gray-500 list-decimal list-inside">
        {#if Array.isArray(data.recipe.ingredients)}
          {#each data.recipe.ingredients as ingredient}
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
        {#if Array.isArray(data.recipe.steps)}
          {#each data.recipe.steps as step}
            <li>
              <span class="text-gray-900">{step}</span>
            </li>
          {/each}
        {/if}
      </ol>
    </div>
  </div>
</div>

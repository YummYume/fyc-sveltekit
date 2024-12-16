<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { crossfade, fade } from 'svelte/transition';

  import Clipboard from '$lib/svg/Clipboard.svelte';
  import Close from '$lib/svg/Close.svelte';
  import Facebook from '$lib/svg/Facebook.svelte';
  import Reddit from '$lib/svg/Reddit.svelte';
  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import StarFull from '$lib/svg/StarFull.svelte';
  import Twitter from '$lib/svg/Twitter.svelte';
  import Warning from '$lib/svg/Warning.svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  import type { PageData } from './$types';

  import { enhance } from '$app/forms';

  export let data: PageData;

  let isIngredientsWarningOpen = true;

  const [send, receive] = crossfade({
    duration: 700,
    easing: quintOut,
  });
  const facebook = encodeURI(`https://www.facebook.com/sharer/sharer.php`);
  const reddit = encodeURI(`https://www.reddit.com/submit`);
  const twitter = encodeURI(`https://twitter.com/intent/tweet`);

  $: starKey = data.isFavourite ? 'full' : 'empty';

  const closeIngredientsWarning = () => {
    isIngredientsWarningOpen = false;
  };
</script>

<div class="mb-4" role="alert">
  {#await data.disallowedIngredients then disallowedIngredients}
    {#if disallowedIngredients && isIngredientsWarningOpen}
      <div
        class="flex items-center rounded-lg gap-2 p-3 bg-amber-600/30 border-2 border-amber-600/75 text-amber-600 max-w-[106.25rem] mx-auto"
        transition:fade={{ duration: prefersReducedMotion() ? 0 : 250 }}
      >
        <Warning class="w-7 h-7 flex-shrink-0" />
        <div class="flex-grow">
          <p>Contient des ingrédients à éviter, indiqués dans votre profil :</p>
          <ul class="list-disc list-inside capitalize ml-4">
            {#each disallowedIngredients as ingredient}
              <li>{ingredient}</li>
            {/each}
          </ul>
        </div>
        <button type="button" aria-label="Fermer cette alerte" on:click={closeIngredientsWarning}>
          <Close />
        </button>
      </div>
    {/if}
  {:catch}
    {#if isIngredientsWarningOpen}
      <div
        class="flex items-center rounded-lg gap-2 p-3 bg-amber-600/30 border-2 border-amber-600/75 text-amber-600 max-w-[106.25rem] mx-auto"
        transition:fade={{ duration: prefersReducedMotion() ? 0 : 250 }}
      >
        <Warning class="w-7 h-7 flex-shrink-0" />
        <p class="flex-grow">
          Impossible de vérifier si la recette contient des ingrédients à ne pas utiliser...
        </p>
        <button type="button" aria-label="Fermer cette alerte" on:click={closeIngredientsWarning}>
          <Close />
        </button>
      </div>
    {/if}
  {/await}
</div>

<div class="flex gap-2 items-center justify-center">
  <form method="POST" action="?/favourite" class="relative" use:enhance>
    <h1 class="h1 first-letter:capitalize" style="view-transition-name: {data.recipe.slug};">
      {data.recipe.dish}
    </h1>
    <button
      aria-label={data.isFavourite
        ? 'Retirer la recette des favoris'
        : 'Ajouter la recette aux favoris'}
      type="submit"
    >
      {#if data.isFavourite}
        <span
          class="absolute -right-1 top-0 translate-x-full"
          in:send={{ key: starKey }}
          out:receive={{ key: starKey }}
        >
          <StarFull />
        </span>
      {:else}
        <span
          class="absolute -right-1 top-0 translate-x-full"
          in:send={{ key: starKey }}
          out:receive={{ key: starKey }}
        >
          <StarEmpty />
        </span>
      {/if}
    </button>
  </form>
</div>

<div class="space-y-8">
  <div class="space-y-2">
    <div
      class="flex gap-2.5 items-center justify-center"
      role="group"
      aria-label="Partager la recette"
    >
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Facebook"
      >
        <Facebook />
      </a>
      <a href={reddit} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Reddit">
        <Reddit />
      </a>
      <a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Twitter (X)"
      >
        <Twitter />
      </a>
    </div>
  </div>

  <section class="container mx-auto space-y-4">
    <p class="mb-8 text-lg text-gray-500 text-center md:text-xl">{data.recipe.description}</p>
    <div class="grid gap-6 md:grid-cols-3">
      <div>
        <div class="mb-2 text-lg font-semibold text-gray-900 flex gap-1 items-center">
          <h2>Ingrédients nécessaires</h2>
          <button
            type="button"
            aria-label="Copier les ingrédients dans le presse-papier"
            disabled={data.recipe.ingredients.length === 0}
            class:opacity-50={data.recipe.ingredients.length === 0}
            class:cursor-not-allowed={data.recipe.ingredients.length === 0}
            on:click={() => {
              copyToClipboard(data.recipe.ingredients.join('\n'), {
                successMessage: 'Liste des ingrédients copiée dans le presse-papier.',
                failureMessage:
                  'Impossible de copier la liste des ingrédients dans le presse-papier.',
                accessDeniedMessage:
                  "Vous devez autoriser l'accès au presse-papier pour copier la liste des ingrédients.",
              });
            }}
          >
            <Clipboard />
          </button>
        </div>
        {#if data.recipe.ingredients.length > 0}
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#each data.recipe.ingredients as ingredient}
              <li>
                <span class="text-gray-900">{ingredient}</span>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="text-gray-500">Aucun ingrédient pour cette recette.</p>
        {/if}
      </div>

      <div>
        <div class="mb-2 text-lg font-semibold text-gray-900 flex gap-1 items-center">
          <h2>Etapes de la recette</h2>
          <button
            type="button"
            aria-label="Copier les étapes dans le presse-papier"
            disabled={data.recipe.steps.length === 0}
            class:opacity-50={data.recipe.steps.length === 0}
            class:cursor-not-allowed={data.recipe.steps.length === 0}
            on:click={() => {
              copyToClipboard(data.recipe.steps.join('\n'), {
                successMessage: 'Liste des étapes copiée dans le presse-papier.',
                failureMessage: 'Impossible de copier la liste des étapes dans le presse-papier.',
                accessDeniedMessage:
                  "Vous devez autoriser l'accès au presse-papier pour copier la liste des étapes.",
              });
            }}
          >
            <Clipboard />
          </button>
        </div>
        {#if data.recipe.steps.length > 0}
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#each data.recipe.steps as step}
              <li>
                <span class="text-gray-900">{step}</span>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="text-gray-500">Aucune étape pour cette recette.</p>
        {/if}
      </div>

      <div>
        <div class="mb-2 text-lg font-semibold text-gray-900 flex gap-1 items-center">
          <h2>Liste de course</h2>
          <button
            type="button"
            aria-label="Copier la liste de course dans le presse-papier"
            disabled={data.recipe.shoppingList.length === 0}
            class:opacity-50={data.recipe.shoppingList.length === 0}
            class:cursor-not-allowed={data.recipe.shoppingList.length === 0}
            on:click={() => {
              copyToClipboard(data.recipe.shoppingList.join('\n'), {
                successMessage: 'Liste de course copiée dans le presse-papier.',
                failureMessage: 'Impossible de copier la liste de course dans le presse-papier.',
                accessDeniedMessage:
                  "Vous devez autoriser l'accès au presse-papier pour copier la liste de course.",
              });
            }}
          >
            <Clipboard />
          </button>
        </div>
        {#if data.recipe.shoppingList.length > 0}
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#each data.recipe.shoppingList as item}
              <li>
                <span class="text-gray-900">{item}</span>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="text-gray-500">Aucune liste de course pour cette recette.</p>
        {/if}
      </div>
    </div>
  </section>

  <section class="container mx-auto space-y-4">
    <h2 class="h2 text-center">Aller plus loin</h2>

    <div class="gap-2.5 grid items-center justify-items-center">
      <a href="/recipes/{data.recipe.slug}/accompaniments" class="btn | mx-0 text-center">
        Demander des accompagnements personnalisés
      </a>
      <a href="/recipes/{data.recipe.slug}/similar" class="btn | mx-0 text-center">
        Trouver des recettes similaires
      </a>
    </div>
  </section>
</div>

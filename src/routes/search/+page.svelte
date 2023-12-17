<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Search from '$lib/components/Search.svelte';
  import ArrowRight from '$lib/svg/ArrowRight.svelte';
  import Spinner from '$lib/svg/Spinner.svelte';

  import type { ActionData, PageData } from './$types';

  import { enhance } from '$app/forms';

  export let data: PageData;

  export let form: ActionData;

  let isLoading = false;
</script>

<h1 class="h1">Recherche</h1>

<div class="max-w-xl mb-4 mx-auto w-full">
  <Search value={data.query} disabled={isLoading} />
</div>

<div class="max-w-xl mx-auto space-y-6 w-full" role="region" aria-live="polite">
  {#await data.result}
    <Loader message={`Recherche de "${data.query}"...`} />
  {:then value}
    {#if !value.recipe}
      <Card>
        <p class="text-gray-500 text-center" role="status">Aucun résulat pour "{data.query}".</p>
        <form
          method="POST"
          action="?/generate"
          class="form"
          use:enhance={({ cancel }) => {
            if (isLoading) {
              cancel();

              return;
            }

            isLoading = true;

            return async ({ update }) => {
              await update();

              isLoading = false;
            };
          }}
        >
          <input type="hidden" name="dish" value={data.query} class="!hidden" />
          <button type="submit" class="btn" disabled={isLoading}>
            {#if isLoading}
              <Spinner />
            {/if}

            Générer la recette
          </button>
        </form>
      </Card>
    {:else}
      <p class="sr-only" role="status">Recette trouvée.</p>
      <a href="/recipes/{value.recipe.slug}" class="btn | w-full">
        <span style="view-transition-name: {value.recipe.slug};">{value.recipe.dish}</span>
        <ArrowRight class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" />
      </a>
    {/if}

    {#if value.suggestions.length}
      <Card>
        <h2 class="h2">Suggestions</h2>

        <nav aria-label="Suggestions">
          <ul class="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg">
            {#each value.suggestions as suggestion, i}
              <li>
                <a
                  href="/recipes/{suggestion.slug}"
                  class="block w-full px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:text-primary-700
                  {i === 0 ? 'rounded-t-lg' : ''} {i === value.suggestions.length - 1
                    ? 'rounded-b-lg'
                    : ''}"
                  style="view-transition-name: {suggestion.slug};"
                >
                  {suggestion.dish}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      </Card>
    {/if}
  {:catch}
    <p class="text-sm font-light text-red-600 text-center" role="status">
      Quelque chose s'est mal passé. Veuillez réessayer plus tard.
    </p>
  {/await}

  {#if form?.error}
    <p class="text-sm font-light text-red-600 text-center">{form.error}</p>
  {/if}
</div>

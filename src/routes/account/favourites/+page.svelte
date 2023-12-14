<script lang="ts">
  import { fade } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { assistantOpen } from '$lib/stores/assistant';
  import { inputDebounce } from '$lib/utils/debounce';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  import type { PageData } from './$types';

  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let data: PageData;

  let perPageForm: HTMLFormElement | null = null;
  let inputValue = data.query;
</script>

<h1 class="h1">Mes favoris</h1>

<div class="container flex flex-col gap-4 px-3 py-8 mx-auto">
  <div class="contents" role="region" aria-live="polite" id="favourites-results">
    {#if data.count > 0}
      <p class="text-center text-lg" role="status">
        {data.count} favori{data.count > 1 ? 's' : ''} trouvé{data.count > 1 ? 's' : ''}.
      </p>
    {:else}
      <p
        class="text-center text-lg"
        role="status"
        in:fade={{
          duration: prefersReducedMotion() ? 0 : 300,
          delay: prefersReducedMotion() ? 0 : 300,
        }}
      >
        Aucun favori pour le moment ! Peut-être que <button
          type="button"
          class="text-green-700 hover:text-green-800 focus-visible:text-green-800 transition-colors motion-reduce:transition-none"
          aria-label="Carlos (ouvrir l'assistant)"
          on:click={() => {
            $assistantOpen = true;
          }}>Carlos</button
        > peut vous aider ?
      </p>
    {/if}

    <form
      class="flex flex-col-reverse md:flex-row justify-between items-center gap-4"
      id="favourites-form"
      method="get"
      bind:this={perPageForm}
      novalidate
      data-sveltekit-keepfocus
    >
      <label>
        <span>Rechercher un favori</span>
        <input
          type="search"
          name="query"
          placeholder="Titre de la recette"
          class="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
          bind:value={inputValue}
          use:inputDebounce={{
            value: inputValue,
            callback: () => {
              if (perPageForm) {
                perPageForm.requestSubmit();
              }
            },
            delay: 250,
          }}
        />
      </label>

      <label>
        <span>Trier par</span>
        <select
          name="order"
          class="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
          on:change={() => {
            if (perPageForm) {
              perPageForm.requestSubmit();
            }
          }}
        >
          <option value="desc" selected={data.order === 'desc'}>Plus récent</option>
          <option value="asc" selected={data.order === 'asc'}>Plus ancien</option>
        </select>
      </label>

      <noscript>
        <button type="submit">Rechercher</button>
      </noscript>
    </form>

    {#if data.count > 0}
      <div
        class="flex flex-col gap-4"
        out:fade={{
          duration: prefersReducedMotion() ? 0 : 300,
        }}
      >
        {#each data.favourites as favourite (favourite.id)}
          <Card>
            <div class="flex gap-1">
              <div class="flex-grow flex flex-col gap-1">
                <a
                  href="/recipes/{favourite.recipe.slug}"
                  class="hover:text-green-600 focus-visible:text-green-600 transition-colors motion-reduce:transition-none"
                >
                  <h2 class="h2">{favourite.recipe.dish}</h2>
                </a>
                <p class="text-gray-600">{favourite.recipe.description}</p>
                <p class="text-sm text-gray-500 mt-auto">
                  Ajoutée le {favourite.createdAt.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div class="my-auto">
                <form
                  method="post"
                  action="/recipes/{favourite.recipe.slug}?/favourite"
                  use:enhance
                >
                  <button
                    type="submit"
                    class="flex items-center justify-center w-fit h-10 text-gray-600 hover:text-red-600 focus-visible:text-red-600 transition-colors motion-reduce:transition-none"
                  >
                    Retirer des favoris
                  </button>
                </form>
              </div>
            </div>
          </Card>
        {:else}
          <div class="flex flex-col gap-2 text-center text-lg">
            <p role="status">On dirait que vous vous êtes perdus ! Cette page n'existe pas.</p>
            <p>
              <a
                class="text-green-600 hover:text-green-800 focus-visible:text-green-800 transition-colors motion-reduce:transition-none"
                href={`/account/favourites?page=${data.totalPages}`}>Retourner à la dernière page</a
              >
            </p>
          </div>
        {/each}

        <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <Pagination
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            url={$page.url.href}
          />

          <select
            name="perPage"
            form="favourites-form"
            aria-label="Nombre de résultats par page"
            class="block px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 w-56 ml-auto"
            aria-controls="favourites-results"
            on:change={() => {
              if (perPageForm) {
                perPageForm.requestSubmit();
              }
            }}
          >
            {#each data.allowedPerPage as perPage}
              <option value={perPage} selected={data.perPage === perPage}>{perPage} par page</option
              >
            {/each}
          </select>

          <noscript>
            <button type="submit" form="favourites-form"
              >Changer le nombre de résultats par page</button
            >
          </noscript>
        </div>
      </div>
    {/if}
  </div>
</div>
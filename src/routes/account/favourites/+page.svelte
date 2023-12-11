<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  import type { PageData } from './$types';

  import { page } from '$app/stores';

  export let data: PageData;
</script>

<h1 class="h1">Mes favoris</h1>

<div class="container flex flex-col gap-4 px-3 py-8 mx-auto">
  {#if data.count === 0}
    <p class="text-center text-lg" role="status">
      Aucun favori pour le moment ! Peut-être que Carlos peut vous aider ?
    </p>
  {:else}
    {#each data.favourites as favourite}
      <Card>
        <a
          href="/recipes/{favourite.recipe.slug}"
          class="hover:text-green-600 focus-visible:text-green-600 transition-colors motion-reduce:transition-none"
        >
          <h2 class="h2">{favourite.recipe.dish}</h2>
        </a>
        <p class="text-gray-600">{favourite.recipe.description}</p>
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

    <Pagination currentPage={data.currentPage} totalPages={data.totalPages} url={$page.url.href} />
  {/if}
</div>

<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1 class="h1">{data.recipe.dish}</h1>

<section class="container mx-auto space-y-4">
  <h2 class="h2 text-center">Accompagnements personnalisés</h2>

  {#if data.accompaniments.length > 0}
    <p class="sr-only" role="status">
      {data.accompaniments.length} accompagnement{data.accompaniments.length > 1 ? 's' : ''} trouvé{data
        .accompaniments.length > 1
        ? 's'
        : ''} pour "{data.recipe.dish}".
    </p>
    <ol class="space-y-1 text-gray-500 list-decimal list-inside w-fit mx-auto">
      {#each data.accompaniments as accompaniment}
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
</section>

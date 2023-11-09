<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/Card.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let isLoading = false;
</script>

<h1 class="h1">Recherche</h1>
<div class="max-w-xl mx-auto w-full">
  <Card>
    {#await data.streamed.result}
      <Loader />
    {:then value}
      {#if value}
        {#if !value.recipe}
          <p class="text-gray-500">Aucun résulat n'a été trouvé, voullez vous le générer ?</p>
          <form
            method="POST"
            action="?/generate"
            class="form"
            use:enhance={() => {
              isLoading = true;
              return async ({ update }) => {
                await update();
                isLoading = false;
              };
            }}
          >
            <input type="text" name="dish" value={data.streamed.dish} class="!hidden" />
            <button type="submit" class="btn" disabled={isLoading}>Générer la recette</button>

            {#if isLoading}
              <Loader />
            {/if}
          </form>
        {:else}
          <a href="/recipes/{value.recipe.slug}">{value.recipe.dish}</a>
        {/if}
      {:else}
        <p class="text-gray-500">Désolé, une erreur est survenue.</p>
      {/if}
    {/await}
  </Card>
</div>

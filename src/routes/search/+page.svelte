<script lang="ts">
  import { enhance } from '$app/forms';
  import Loader from '$lib/components/Loader.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let isLoading = false;
</script>

<h1 class="h1">Recherche</h1>

{#await data.streamed.result}
  <Loader />
{:then value}
  <p>{value.choices[0].message.content}</p>
  <form
    method="POST"
    action="?/generate"
    use:enhance={() => {
      isLoading = true;
      return async ({ update }) => {
        await update();
        isLoading = false;
      };
    }}
  >
    <input type="text" name="dish" value={data.streamed.dish} class="hidden" />
    <button type="submit" class="btn" disabled={isLoading}>Générer la recette</button>

    {#if isLoading}
      <Loader />
    {/if}
  </form>
{/await}

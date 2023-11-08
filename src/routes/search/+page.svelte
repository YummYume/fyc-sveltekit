<script lang="ts">
  import Loader from '$lib/components/Loader.svelte';
  import { slugify } from '$lib/utils/functions';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1 class="h1">Recherche</h1>

{#await data.streamed.result}
  <Loader />
{:then value}
  <p>{value.choices[0].message.content}</p>
  <form method="GET" action="/recipe">
    <input type="text" name="dish" value={slugify(data.streamed.dish)} class="hidden" />
    <button type="submit" class="btn">Générer la recette</button>
  </form>
{/await}

<script lang="ts">
  import Search from '$lib/components/Search.svelte';
</script>

<svelte:head>
  <title>CookConnect</title>
  <meta
    name="description"
    content="CookConnect, le moteur de recherche de recettes de cuisine, alimenté par l'intelligence artificielle."
  />
</svelte:head>

<h1 class="h1">CookConnect</h1>
<div class="max-w-xl mx-auto w-full">
  <Search />
</div>

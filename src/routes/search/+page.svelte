<script lang="ts">
  import Loader from '$lib/components/Loader.svelte';
</script>

<h1 class="h1">Recherche</h1>

<div class="max-w-xl mb-4 mx-auto w-full">
  <input
    type="search"
    class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none"
    aria-label="Rechercher une recette"
    placeholder="Rechercher une recette"
  />
</div>

<div class="max-w-xl mx-auto space-y-6 w-full" role="region" aria-live="polite">
  <Loader message="Recherche en cours" />
</div>

<script lang="ts">
  import Search from '$lib/svg/Search.svelte';

  export let value = '';
  export let disabled = false;
</script>

<form
  action="/search"
  method="GET"
  class="form"
  on:submit={(e) => {
    if (disabled) {
      e.preventDefault();
    }
  }}
>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search class="h-4 w-4 text-gray-500" aria-hidden="true" />
    </div>
    <input
      type="search"
      id="q"
      placeholder="Poulet-frites, Raclette, Pizza..."
      required
      aria-label="Rechercher un plat"
      name="q"
      class="!p-4 !pl-10 !pr-32"
      {value}
    />
    <button type="submit" class="btn | absolute right-2.5 bottom-2.5 px-4 py-2 w-fit" {disabled}>
      Rechercher
    </button>
  </div>
</form>

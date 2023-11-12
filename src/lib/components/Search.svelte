<script lang="ts">
  export let value = '';
</script>

<form action="/search" method="GET" class="form">
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <svg
        class="w-4 h-4 text-gray-500"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
        />
      </svg>
    </div>
    <input
      type="search"
      id="q"
      placeholder="Poulet-frites, Raclette, Pizza..."
      required
      aria-label="Rechercher un plat"
      name="q"
      class="!p-4 !pl-10"
      {value}
    />
    <button type="submit" class="btn | absolute right-2.5 bottom-2.5 px-4 py-2 w-fit">
      Rechercher
    </button>
  </div>
</form>

<script lang="ts">
  import '../app.scss';

  import Assistant from '$lib/components/Assistant.svelte';
  import UserCircle from '$lib/svg/UserCircle.svelte';

  import type { PageData } from './$types';

  import { enhance } from '$app/forms';
  import { onNavigate } from '$app/navigation';

  export let data: PageData;

  onNavigate((navigation) => {
    if (!document.startViewTransition) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();

        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <title>CookConnect</title>
</svelte:head>

<nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
  <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
    <a
      href="/"
      class="
        text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-bold rounded-lg text-xl
        px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none
      "
    >
      CookConnect
    </a>

    {#if data.user}
      <div class="flex items-center lg:order-2">
        <form method="POST" action="/?/logout" use:enhance>
          <button
            type="submit"
            class="
              text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium
              rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none
            "
          >
            Se déconnecter
          </button>
        </form>
        <a aria-label="Profil" href="/account">
          <UserCircle />
        </a>
      </div>
    {/if}
  </div>
</nav>
<main class="flex flex-col grow p-5">
  <slot />
  {#if data.user}
    <Assistant />
  {/if}
</main>

<script lang="ts">
  import '../app.scss';

  import { SvelteToast } from '@zerodevx/svelte-toast';
  import { blur } from 'svelte/transition';

  import Assistant from '$lib/components/Assistant.svelte';
  import { assistantOpen } from '$lib/stores/assistant';
  import UserCircle from '$lib/svg/UserCircle.svelte';
  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { requestAnimationFrame } from '$lib/utils/request-animation-frame';

  import type { LayoutData } from './$types';

  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let data: LayoutData;

  let assistantButton: HTMLButtonElement | null = null;
</script>

<svelte:head>
  {#key $page.data.seo}
    {#if $page.data.seo?.title}
      <title>{$page.data.seo.title}</title>
    {/if}
  {/key}
  {#if $page.data.seo?.meta}
    {#each Object.entries($page.data.seo.meta) as [name, content] (name)}
      <meta {name} {content} />
    {/each}
  {/if}
</svelte:head>

<SvelteToast
  options={{
    duration: 5000,
    dismissable: true,
    pausable: true,
  }}
/>

<header class="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
  <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
    <a
      href="/"
      class="
        text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-bold rounded-lg text-xl
        px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 sm:ml-0 mx-auto focus:outline-none
      "
    >
      CookConnect
    </a>

    {#if data.user}
      <nav class="flex items-center lg:order-2 sm:mx-0 mx-auto">
        <ul class="contents">
          <li>
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
          </li>
          <li>
            <a
              class="
              text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium
              rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none
            "
              href="/account/favourites"
            >
              Mes favoris
            </a>
          </li>
          <li>
            <a aria-label="Mon profil" href="/account">
              <UserCircle aria-hidden="true" />
            </a>
          </li>
        </ul>
      </nav>
    {/if}
  </div>
</header>

<main class="flex flex-col grow p-5">
  <slot />

  {#if data.user}
    <div class="bottom-0 left-0 p-2.5 fixed lg:p-5">
      <div class="relative">
        {#key $assistantOpen}
          <button
            aria-label="Discuter avec l'assistant personnel"
            aria-haspopup="dialog"
            aria-expanded={$assistantOpen ? 'true' : 'false'}
            class="absolute bottom-0 h-10 w-10 sm:h-20 sm:w-20 bg-slate-400 rounded-full"
            bind:this={assistantButton}
            on:click={() => {
              $assistantOpen = true;
            }}
            transition:blur={{ amount: 10, duration: prefersReducedMotion() ? 0 : 1000 }}
          >
            <enhanced:img
              src="$lib/assets/carlos.png"
              alt="Assistant personnel Carlos"
              class="rounded-full shadow-2xl"
            />
          </button>
        {/key}

        <Assistant
          open={$assistantOpen}
          on:close={() => {
            $assistantOpen = false;

            requestAnimationFrame(() => {
              if (assistantButton) {
                assistantButton.focus();
              }
            });
          }}
        />
      </div>
    </div>
  {/if}
</main>

<style>
  :root {
    --toastContainerTop: auto;
    --toastContainerBottom: 1.5rem;
    --toastBorderRadius: 0.5rem;
  }

  @media (max-width: 640px) {
    :root {
      --toastContainerTop: 1.5rem;
      --toastContainerBottom: auto;
    }
  }
</style>

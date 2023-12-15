<script lang="ts">
  import { assistantOpen } from '$lib/stores/assistant';

  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status}</title>
  <meta name="description" content={$page.error?.message ?? 'Une erreur est survenue.'} />
  <meta name="robots" content="noindex" />
  <meta name="googlebot" content="noindex" />
</svelte:head>

<section>
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
    <div class="mx-auto max-w-screen-sm text-center">
      <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600">
        {$page.status}
      </h1>
      <p class="mb-4 text-lg font-light text-gray-500">
        {$page.error?.message ?? 'Une erreur est survenue.'}
      </p>
      <p class="mb-4 text-lg font-light text-gray-800">
        Besoin d'aide ? <button
          type="button"
          class="text-green-700 hover:text-green-800 focus-visible:text-green-800 transition-colors motion-reduce:transition-none"
          aria-label="Carlos (ouvrir l'assistant)"
          aria-haspopup="dialog"
          on:click={() => {
            $assistantOpen = true;
          }}>Carlos</button
        > peut vous aider.
      </p>
      <a
        href="/"
        class="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4"
      >
        Retour à l'accueil
      </a>
    </div>
  </div>
</section>

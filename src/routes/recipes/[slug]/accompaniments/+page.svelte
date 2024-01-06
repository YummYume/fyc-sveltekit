<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade, type FadeParams } from 'svelte/transition';

  import Loader from '$lib/components/Loader.svelte';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  import Result from './Result.svelte';

  import type { PageData } from './$types';

  export let data: PageData;

  const fadeParams: FadeParams = {
    duration: prefersReducedMotion() ? 0 : 300,
    easing: cubicOut,
  };
</script>

<h1 class="h1">{data.recipe.dish}</h1>

<section class="container mx-auto space-y-4" aria-live="polite">
  <h2 class="h2 text-center">Accompagnements personnalisés</h2>

  {#await data.accompaniments}
    <Loader message="Chargement des accompagnements..." />
  {:then accompaniments}
    <Result dish={data.recipe.dish} {accompaniments} />
  {:catch}
    <p class="text-red-500 text-center" role="status" transition:fade={fadeParams}>
      Une erreur est survenue lors du chargement des accompagnements. Veuillez réessayer plus tard.
    </p>
  {/await}

  <a href="/recipes/{data.recipe.slug}" class="btn">Retour à la recette</a>
</section>

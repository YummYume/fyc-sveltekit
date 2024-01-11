<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade, type FadeParams } from 'svelte/transition';

  import Loader from '$lib/components/Loader.svelte';
  import SeasonBadge from '$lib/components/SeasonBadge.svelte';
  import { getCurrentSeason } from '$lib/utils/date';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  import Result from './Result.svelte';

  import type { PageData } from './$types';

  export let data: PageData;

  const fadeParams: FadeParams = {
    duration: prefersReducedMotion() ? 0 : 300,
    easing: cubicOut,
  };
  const season = getCurrentSeason();
</script>

<h1 class="h1">{data.recipe.dish}</h1>

<section class="container mx-auto space-y-4" aria-live="polite">
  <div class="flex flex-wrap items-center justify-between gap-1">
    <h2 class="h2">Recettes similaires</h2>
    <SeasonBadge {season} />
  </div>

  {#await data.similarRecipes}
    <Loader message="Chargement des recettes similaires..." />
  {:then similarRecipes}
    <Result dish={data.recipe.dish} {similarRecipes} />
  {:catch}
    <p class="text-red-500 text-center" role="status" transition:fade={fadeParams}>
      Une erreur est survenue lors du chargement des recettes similaires. Veuillez réessayer plus
      tard.
    </p>
  {/await}

  <a href="/recipes/{data.recipe.slug}" class="btn">Retour à la recette</a>
</section>

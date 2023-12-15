<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { crossfade, fade } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import Spinner from '$lib/svg/Spinner.svelte';
  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import StarFull from '$lib/svg/StarFull.svelte';
  import { infiniteScrollSubmit } from '$lib/utils/infinite-scroll';
  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { toasts } from '$lib/utils/toats';

  import type { PageData, ActionData } from './$types';
  import type { Review, User } from '@prisma/client';

  import { enhance } from '$app/forms';

  export let data: PageData;
  export let form: ActionData;

  // Constants
  const [send, receive] = crossfade({
    duration: 700,
    easing: quintOut,
  });

  // Variables
  let reviews: (Review & { user: User })[] = [];
  let loading = false;
  let noMoreReviews = false;

  // Computed
  $: starKey = data.isFavourite ? 'full' : 'empty';

  // Lifecycle
  // New reviews loaded
  $: if (form?.reviews) {
    if (form.reviews.length < 10) {
      noMoreReviews = true;
    }

    reviews = [
      ...reviews,
      ...form.reviews.filter((review) => !reviews.some(({ id }) => id === review.id)),
    ];
  }

  // Review added or updated
  $: if (form?.review) {
    const index = reviews.findIndex(({ id }) => id === form?.review?.id);

    if (index !== -1) {
      const updatedReviews = [...reviews];

      updatedReviews[index] = form.review;
      reviews = updatedReviews;
    } else {
      reviews = [form.review, ...reviews];
    }
  }

  // Review removed
  $: if (form?.removedReview) {
    reviews = reviews.filter(({ id }) => id !== form?.removedReview?.id);
  }

  // Error while loading or removing review(s)
  $: if (form?.loadReviewsError) {
    toasts.error(form.loadReviewsError);
  } else if (form?.removeReviewError) {
    toasts.error(form.removeReviewError);
  }

  const clipBoard = () => {
    let shoppingList = data.recipe.shoppingList as string[];
    navigator.clipboard.writeText(shoppingList.join('\n'));
  };

  const postOnSocialMedia = (media: string) => {};
</script>

<div class="flex gap-2 items-center justify-center">
  <form method="POST" action="?/favourite" class="relative" use:enhance>
    <h1 class="h1 first-letter:capitalize">{data.recipe.dish}</h1>
    <button
      aria-label={data.isFavourite
        ? 'Retirer la recette des favoris'
        : 'Ajouter la recette aux favoris'}
      type="submit"
    >
      {#if data.isFavourite}
        <span
          class="absolute -right-1 top-0 translate-x-full"
          in:send={{ key: starKey }}
          out:receive={{ key: starKey }}
        >
          <StarFull />
        </span>
      {:else}
        <span
          class="absolute -right-1 top-0 translate-x-full"
          in:send={{ key: starKey }}
          out:receive={{ key: starKey }}
        >
          <StarEmpty />
        </span>
      {/if}
    </button>
  </form>

  {#if data.reviewCount > 0}
    <div class="flex gap-1 items-center">
      <span class="text-gray-500 text-sm">Note des utilisateurs</span>
      <span class="text-gray-900 text-lg font-semibold">{data.reviewAverage}</span>
      <StarFull class="w-5 h-5 text-yellow-500" />
      <button on:click={clipBoard}>clipBoard</button>
    </div>
  {/if}
</div>

<section class="container mx-auto">
  <p class="mb-3 text-lg text-gray-500 text-center md:text-xl">{data.recipe.description}</p>
  <div class="grid gap-6 sm:grid-cols-2">
    <div>
      <h2 class="mb-2 text-lg font-semibold text-gray-900">Ingrédients nécessaires</h2>
      <ol class="space-y-1 text-gray-500 list-decimal list-inside">
        {#if Array.isArray(data.recipe.ingredients)}
          {#each data.recipe.ingredients as ingredient}
            <li>
              <span class="text-gray-900">{ingredient}</span>
            </li>
          {/each}
        {/if}
      </ol>
    </div>
    <div>
      <h2 class="mb-2 text-lg font-semibold text-gray-900">Etapes de la recette</h2>
      <ol class="space-y-1 text-gray-500 list-decimal list-inside">
        {#if Array.isArray(data.recipe.steps)}
          {#each data.recipe.steps as step}
            <li>
              <span class="text-gray-900">{step}</span>
            </li>
          {/each}
        {/if}
      </ol>
    </div>
  </div>
</section>

<section class="container mx-auto flex flex-col gap-5">
  <h2 class="h2">Avis ({data.reviewCount})</h2>

  <form
    action="?/review"
    method="post"
    class="flex flex-col gap-2"
    use:enhance={() => {
      return async ({ update }) => {
        await update({ reset: false });
      };
    }}
  >
    <h3 class="h3">Votre avis</h3>

    <label class="flex flex-col gap-1">
      <span>Votre commentaire</span>
      <textarea
        id="content"
        name="content"
        rows="5"
        required
        placeholder="J'adore cette recette..."
        class="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 resize-y"
        >{data.userReview?.content ?? ''}</textarea
      >
    </label>

    <label class="flex flex-col gap-1">
      <span>Votre note</span>
      <select
        id="rating"
        name="rating"
        required
        class="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
      >
        {#each data.allowedRatings as rating}
          <option value={rating} selected={rating === data.userReview?.rating}>
            {rating}
          </option>
        {/each}
      </select>
    </label>

    {#if form?.reviewError}
      <p
        role="status"
        class="text-red-500 text-sm"
        in:fade={{ duration: prefersReducedMotion() ? 0 : 250 }}
      >
        {form.reviewError}
      </p>
    {/if}

    {#if data.userReview}
      <form class="contents" method="post" action="?/removeReview" id="remove-review" use:enhance>
        <input type="hidden" name="id" value={data.userReview.id} />
        <button type="submit" class="btn | w-full bg-red-600"> Supprimer l'avis </button>
      </form>
    {/if}

    <button type="submit" class="btn | w-full" aria-controls="reviews">Envoyer</button>
  </form>

  <div class="flex flex-col gap-2" id="reviews" role="region" aria-live="polite">
    {#each reviews as review (review.id)}
      {@const titleId = `review-${review.id}-title`}
      {@const contentId = `review-${review.id}-content`}
      {@const isAuthor = data.user.userId === review.user.id}

      <Card
        tabindex="0"
        containerClass="!w-11/12 {isAuthor ? 'border-green-600 ml-auto' : 'mr-auto'}"
        aria-labelledby={titleId}
        aria-describedby={contentId}
      >
        <div class="flex gap-1 justify-between">
          <div class="flex flex-col gap-1">
            <h3 class="h3" id={titleId}>Avis de {review.user.username} ({review.rating}/5)</h3>
            <p id={contentId}>{review.content}</p>
            <p class="text-sm text-gray-500 mt-auto">
              Le {review.createdAt.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          {#if isAuthor}
            <div class="my-auto">
              <button
                type="submit"
                form="remove-review"
                class="flex items-center justify-center w-fit text-gray-600 hover:text-red-600 focus-visible:text-red-600 transition-colors motion-reduce:transition-none"
              >
                Supprimer l'avis
              </button>
            </div>
          {/if}
        </div>
      </Card>
    {:else}
      {#if noMoreReviews}
        <p role="status" class="text-gray-800 text-center">Aucun avis pour le moment.</p>
      {/if}
    {/each}
  </div>

  {#if !noMoreReviews}
    {#if loading}
      <div class="flex flex-col gap-1 items-center justify-center w-full">
        <Spinner size="h-8 w-8" color="text-green-600" />
        <p role="status" class="text-gray-500 text-center">Chargement des avis...</p>
      </div>
    {:else}
      <form
        action="?/loadReviews"
        method="post"
        use:infiniteScrollSubmit={{ disabled: !!form?.loadReviewsError }}
        use:enhance={() => {
          loading = true;

          return async ({ update }) => {
            await update();

            loading = false;
          };
        }}
      >
        <input type="hidden" name="cursor" value={reviews.at(-1)?.id} />

        <noscript>
          <button type="submit" class="btn | w-full">Charger plus d'avis</button>
        </noscript>
      </form>
    {/if}
  {/if}
</section>

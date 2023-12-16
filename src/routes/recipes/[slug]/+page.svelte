<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { crossfade, fade } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import Clipboard from '$lib/svg/Clipboard.svelte';
  import Facebook from '$lib/svg/Facebook.svelte';
  import Reddit from '$lib/svg/Reddit.svelte';
  import Spinner from '$lib/svg/Spinner.svelte';
  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import StarFull from '$lib/svg/StarFull.svelte';
  import Twitter from '$lib/svg/Twitter.svelte';
  import { infiniteScrollSubmit } from '$lib/utils/infinite-scroll';
  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { toasts } from '$lib/utils/toats';

  import type { ActionData, PageData } from './$types';
  import type { Review, User } from '@prisma/client';

  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

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

  const shoppingList = (data.recipe.shoppingList as string[]).join('\n');
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${$page.url}&quote=${shoppingList}&hashtag=recette,listedecourse`;
  const reddit = `https://www.reddit.com/submit?url=${$page.url}&title=${data.recipe.dish}&text=${shoppingList}`;
  const twitter = `https://twitter.com/intent/tweet?url=${$page.url}&text=${shoppingList}&hashtags=recette,listedecourse`;

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
    navigator.clipboard.writeText(shoppingList);
  };
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

  <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook"
    ><Facebook /></a
  >
  <a href={reddit} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Reddit"
    ><Reddit /></a
  >
  <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Twitter (X)"
    ><Twitter /></a
  >
  <button type="button" on:click={clipBoard} aria-label="Copier dans le presse-papier"
    ><Clipboard /></button
  >
</div>
<div class="space-y-5">
  {#if data.reviewCount > 0}
    <div class="flex gap-2.5 items-center justify-center">
      <span class="text-gray-500">Note moyenne des utilisateurs :</span>
      <div class="flex">
        <span class="text-gray-900 text-lg font-semibold">{data.reviewAverage}</span>
        <StarFull class="w-4 h-4 text-yellow-500" />
      </div>
    </div>
  {/if}

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
  <section class="container mx-auto space-y-5">
    <h2 class="h2">Avis ({data.reviewCount})</h2>
    <form
      action="?/review"
      method="post"
      class="space-y-2.5"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <div class="flex gap-2.5 items-center">
        <h3 class="h3">Votre avis</h3>

        {#if data.userReview}
          <form
            class="contents"
            method="post"
            action="?/removeReview"
            id="remove-review"
            use:enhance
          >
            <input type="hidden" name="id" value={data.userReview.id} />
            <button
              aria-label="Supprimer l'avis"
              type="submit"
              class="btn | bg-red-600 mx-0 p-2.5 hover:!bg-red-700"
            >
              <svg
                class="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
              >
                <path
                  d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"
                />
              </svg>
            </button>
          </form>
        {/if}
      </div>
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

      <button type="submit" class="btn | justify-center w-full" aria-controls="reviews"
        >Envoyer</button
      >
    </form>

    <div class="flex flex-col gap-2" id="reviews" role="region" aria-live="polite">
      {#each reviews as review (review.id)}
        {@const titleId = `review-${review.id}-title`}
        {@const contentId = `review-${review.id}-content`}
        {@const isAuthor = data.user.userId === review.user.id}

        <Card
          tabindex="0"
          containerClass={isAuthor ? 'border border-green-600' : ''}
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
              <button
                aria-label="Supprimer l'avis"
                class="btn | bg-red-600 mb-auto mx-0 p-2.5 hover:!bg-red-700"
                form="remove-review"
                type="submit"
              >
                <svg
                  class="w-6 h-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 20"
                >
                  <path
                    d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"
                  />
                </svg>
              </button>
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
</div>

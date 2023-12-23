<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { crossfade, fade } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Clipboard from '$lib/svg/Clipboard.svelte';
  import Close from '$lib/svg/Close.svelte';
  import Facebook from '$lib/svg/Facebook.svelte';
  import Reddit from '$lib/svg/Reddit.svelte';
  import Spinner from '$lib/svg/Spinner.svelte';
  import StarEmpty from '$lib/svg/StarEmpty.svelte';
  import StarFull from '$lib/svg/StarFull.svelte';
  import Trash from '$lib/svg/Trash.svelte';
  import Twitter from '$lib/svg/Twitter.svelte';
  import Warning from '$lib/svg/Warning.svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import { infiniteScrollSubmit } from '$lib/utils/infinite-scroll';
  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { toasts } from '$lib/utils/toats';

  import AccompanimentsResult from './accompaniments/Result.svelte';
  import SimilarRecipesResult from './similar/Result.svelte';

  import type { PreloadedPageData } from '$lib/types/preload';
  import type { ActionData, PageData } from './$types';
  import type { PageData as AccompanimentsPageData } from './accompaniments/$types';
  import type { PageData as SimilarRecipesPageData } from './similar/$types';
  import type { Review, User } from '@prisma/client';

  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import { goto, preloadData, pushState } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: PageData;
  export let form: ActionData;

  // Constants
  const [send, receive] = crossfade({
    duration: 700,
    easing: quintOut,
  });
  const facebook = encodeURI(
    `https://www.facebook.com/sharer/sharer.php?u=\n\n${$page.url}&quote=${
      data.recipe.dish
    }\n\n* ${data.recipe.shoppingList.join('\n* ')}&hashtag=recette,listedecourse`,
  );
  const reddit = encodeURI(
    `https://www.reddit.com/submit?url=${$page.url}&title=${
      data.recipe.dish
    }&text=* ${data.recipe.shoppingList.join('\n* ')}`,
  );
  const twitter = encodeURI(
    `https://twitter.com/intent/tweet?url=\n\n${$page.url}&text=${
      data.recipe.dish
    }\n\n* ${data.recipe.shoppingList.join('\n* ')}&hashtags=recette,listedecourse`,
  );

  // Variables
  let reviews: (Review & { user: User })[] = [];
  let loading = false;
  let noMoreReviews = false;
  let accompanimentsLoading = false;
  let similarRecipesLoading = false;
  let isIngredientsWarningOpen = true;

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

  // Functions
  const closeIngredientsWarning = () => {
    isIngredientsWarningOpen = false;
  };

  const showAccompaniments = async (e: MouseEvent & { currentTarget: HTMLAnchorElement }) => {
    if (e.metaKey || e.ctrlKey || accompanimentsLoading) {
      return;
    }

    e.preventDefault();

    accompanimentsLoading = true;

    try {
      const { href } = e.currentTarget;
      const result = (await preloadData(href)) as PreloadedPageData<AccompanimentsPageData>;

      if (result.type === 'loaded' && result.status === 200) {
        pushState(href, {
          accompaniments: {
            ...result.data,
            accompaniments: await result.data.accompaniments,
          },
        });
      } else {
        goto(href);
      }
    } catch (error) {
      toasts.error('Impossible de charger les accompagnements personnalisés. Veuillez réessayer.');
    }

    accompanimentsLoading = false;
  };

  const showSimilarRecipes = async (e: MouseEvent & { currentTarget: HTMLAnchorElement }) => {
    if (e.metaKey || e.ctrlKey || similarRecipesLoading) {
      return;
    }

    e.preventDefault();

    similarRecipesLoading = true;

    try {
      const { href } = e.currentTarget;
      const result = (await preloadData(href)) as PreloadedPageData<SimilarRecipesPageData>;

      if (result.type === 'loaded' && result.status === 200) {
        pushState(href, {
          similarRecipes: {
            ...result.data,
            similarRecipes: await result.data.similarRecipes,
          },
        });
      } else {
        goto(href);
      }
    } catch (error) {
      toasts.error('Impossible de charger les recettes similaires. Veuillez réessayer.');
    }

    similarRecipesLoading = false;
  };

  const closeCurrentModal = () => {
    if (!browser) {
      return;
    }

    window.history.back();
  };
</script>

<Modal
  id="accompaniments"
  title="Accompagnements"
  description="Liste des accompagnements personnalisés pour cette recette."
  open={!!$page.state.accompaniments}
  on:close={closeCurrentModal}
>
  {#if !!$page.state.accompaniments}
    <AccompanimentsResult
      dish={data.recipe.dish}
      accompaniments={$page.state.accompaniments.accompaniments}
    />

    <div class="flex gap-2 justify-end mt-4">
      {#if $page.state.accompaniments.accompaniments.length > 0}
        <button
          type="button"
          class="btn mx-0"
          on:click={() => {
            if (!$page.state.accompaniments) {
              return;
            }

            copyToClipboard($page.state.accompaniments.accompaniments.join('\n'), {
              successMessage: 'Liste des accompagnements copiée dans le presse-papier.',
              failureMessage:
                'Impossible de copier la liste des accompagnements dans le presse-papier.',
              accessDeniedMessage:
                "Vous devez autoriser l'accès au presse-papier pour copier la liste des accompagnements.",
            });
          }}
        >
          Copier la liste
        </button>
      {/if}
      <button type="button" class="btn mx-0" on:click={closeCurrentModal}>Fermer</button>
    </div>
  {/if}
</Modal>

<Modal
  id="similar"
  title="Recettes similaires"
  description="Liste des recettes similaires à celle-ci."
  open={!!$page.state.similarRecipes}
  on:close={closeCurrentModal}
>
  {#if !!$page.state.similarRecipes}
    <SimilarRecipesResult
      dish={data.recipe.dish}
      similarRecipes={$page.state.similarRecipes.similarRecipes}
    />

    <div class="flex gap-2 justify-end mt-4">
      <button type="button" class="btn mx-0" on:click={closeCurrentModal}>Fermer</button>
    </div>
  {/if}
</Modal>

<div class="mb-4" role="alert">
  {#await data.disallowedIngredients then disallowedIngredients}
    {#if disallowedIngredients && isIngredientsWarningOpen}
      <div
        class="flex items-center rounded-lg gap-2 p-3 bg-amber-600/30 border-2 border-amber-600/75 text-amber-600 max-w-[106.25rem] mx-auto"
        transition:fade={{ duration: prefersReducedMotion() ? 0 : 250 }}
      >
        <Warning class="w-7 h-7 flex-shrink-0" />
        <div class="flex-grow">
          <p>Contient des ingrédients à éviter, indiqués dans votre profil :</p>
          <ul class="list-disc list-inside capitalize ml-4">
            {#each disallowedIngredients as ingredient}
              <li>{ingredient}</li>
            {/each}
          </ul>
        </div>
        <button type="button" aria-label="Fermer cette alerte" on:click={closeIngredientsWarning}>
          <Close />
        </button>
      </div>
    {/if}
  {:catch}
    {#if isIngredientsWarningOpen}
      <div
        class="flex items-center rounded-lg gap-2 p-3 bg-amber-600/30 border-2 border-amber-600/75 text-amber-600 max-w-[106.25rem] mx-auto"
        transition:fade={{ duration: prefersReducedMotion() ? 0 : 250 }}
      >
        <Warning class="w-7 h-7 flex-shrink-0" />
        <p class="flex-grow">
          Impossible de vérifier si la recette contient des ingrédients à ne pas utiliser...
        </p>
        <button type="button" aria-label="Fermer cette alerte" on:click={closeIngredientsWarning}>
          <Close />
        </button>
      </div>
    {/if}
  {/await}
</div>

<div class="flex gap-2 items-center justify-center">
  <form method="POST" action="?/favourite" class="relative" use:enhance>
    <h1 class="h1 first-letter:capitalize" style="view-transition-name: {data.recipe.slug};">
      {data.recipe.dish}
    </h1>
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
</div>

<div class="space-y-8">
  <div class="space-y-2">
    {#if data.reviewCount > 0}
      <div class="flex gap-2.5 items-center justify-center">
        <span class="text-gray-500">Note moyenne des utilisateurs :</span>
        <p class="flex" aria-label="{data.reviewAverage} sur 5">
          <span class="text-gray-900 text-lg font-semibold">{data.reviewAverage}</span>
          <StarFull class="w-4 h-4 text-yellow-500" />
        </p>
      </div>
    {/if}

    <div
      class="flex gap-2.5 items-center justify-center"
      role="group"
      aria-label="Partager la recette"
    >
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Facebook"
      >
        <Facebook />
      </a>
      <a href={reddit} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Reddit">
        <Reddit />
      </a>
      <a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Twitter (X)"
      >
        <Twitter />
      </a>
    </div>
  </div>

  <section class="container mx-auto space-y-4">
    <p class="mb-8 text-lg text-gray-500 text-center md:text-xl">{data.recipe.description}</p>
    <div class="grid gap-6 md:grid-cols-3">
      <div>
        <div class="mb-2 text-lg font-semibold text-gray-900 flex gap-1 items-center">
          <h2>Ingrédients nécessaires</h2>
          <button
            type="button"
            aria-label="Copier les ingrédients dans le presse-papier"
            disabled={data.recipe.ingredients.length === 0}
            class:opacity-50={data.recipe.ingredients.length === 0}
            class:cursor-not-allowed={data.recipe.ingredients.length === 0}
            on:click={() => {
              copyToClipboard(data.recipe.ingredients.join('\n'), {
                successMessage: 'Liste des ingrédients copiée dans le presse-papier.',
                failureMessage:
                  'Impossible de copier la liste des ingrédients dans le presse-papier.',
                accessDeniedMessage:
                  "Vous devez autoriser l'accès au presse-papier pour copier la liste des ingrédients.",
              });
            }}
          >
            <Clipboard />
          </button>
        </div>
        {#if data.recipe.ingredients.length > 0}
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#each data.recipe.ingredients as ingredient}
              <li>
                <span class="text-gray-900">{ingredient}</span>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="text-gray-500">Aucun ingrédient pour cette recette.</p>
        {/if}
      </div>

      <div>
        <div class="mb-2 text-lg font-semibold text-gray-900 flex gap-1 items-center">
          <h2>Etapes de la recette</h2>
          <button
            type="button"
            aria-label="Copier les étapes dans le presse-papier"
            disabled={data.recipe.steps.length === 0}
            class:opacity-50={data.recipe.steps.length === 0}
            class:cursor-not-allowed={data.recipe.steps.length === 0}
            on:click={() => {
              copyToClipboard(data.recipe.steps.join('\n'), {
                successMessage: 'Liste des étapes copiée dans le presse-papier.',
                failureMessage: 'Impossible de copier la liste des étapes dans le presse-papier.',
                accessDeniedMessage:
                  "Vous devez autoriser l'accès au presse-papier pour copier la liste des étapes.",
              });
            }}
          >
            <Clipboard />
          </button>
        </div>
        {#if data.recipe.steps.length > 0}
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#each data.recipe.steps as step}
              <li>
                <span class="text-gray-900">{step}</span>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="text-gray-500">Aucune étape pour cette recette.</p>
        {/if}
      </div>

      <div>
        <div class="mb-2 text-lg font-semibold text-gray-900 flex gap-1 items-center">
          <h2>Liste de course</h2>
          <button
            type="button"
            aria-label="Copier la liste de course dans le presse-papier"
            disabled={data.recipe.shoppingList.length === 0}
            class:opacity-50={data.recipe.shoppingList.length === 0}
            class:cursor-not-allowed={data.recipe.shoppingList.length === 0}
            on:click={() => {
              copyToClipboard(data.recipe.shoppingList.join('\n'), {
                successMessage: 'Liste de course copiée dans le presse-papier.',
                failureMessage: 'Impossible de copier la liste de course dans le presse-papier.',
                accessDeniedMessage:
                  "Vous devez autoriser l'accès au presse-papier pour copier la liste de course.",
              });
            }}
          >
            <Clipboard />
          </button>
        </div>
        {#if data.recipe.shoppingList.length > 0}
          <ol class="space-y-1 text-gray-500 list-decimal list-inside">
            {#each data.recipe.shoppingList as item}
              <li>
                <span class="text-gray-900">{item}</span>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="text-gray-500">Aucune liste de course pour cette recette.</p>
        {/if}
      </div>
    </div>
  </section>

  <section class="container mx-auto space-y-4">
    <h2 class="h2 text-center">Aller plus loin</h2>

    <div class="gap-2.5 grid items-center justify-items-center">
      <a
        href="/recipes/{data.recipe.slug}/accompaniments"
        class="btn | mx-0 text-center"
        class:opacity-50={accompanimentsLoading}
        class:cursor-not-allowed={accompanimentsLoading}
        aria-disabled={accompanimentsLoading ? 'true' : 'false'}
        on:click={showAccompaniments}
      >
        {#if accompanimentsLoading}
          <Spinner />
        {/if}

        Demander des accompagnements personnalisés
      </a>
      <a
        href="/recipes/{data.recipe.slug}/similar"
        class="btn | mx-0 text-center"
        class:opacity-50={similarRecipesLoading}
        class:cursor-not-allowed={similarRecipesLoading}
        aria-disabled={similarRecipesLoading ? 'true' : 'false'}
        on:click={showSimilarRecipes}
      >
        {#if similarRecipesLoading}
          <Spinner />
        {/if}

        Trouver des recettes similaires
      </a>
    </div>
  </section>

  <section class="container mx-auto space-y-4">
    <h2 class="h2">Avis ({data.reviewCount})</h2>

    {#if data.userReview}
      <form
        class="contents"
        method="post"
        action="?/removeReview"
        id="remove-review"
        use:enhance
      ></form>
    {/if}

    <form
      action="?/review"
      method="post"
      class="space-y-2.5 border border-primary-600 bg-white rounded-md p-5"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <div class="flex gap-2.5 items-center">
        <h3 class="h3">Votre avis</h3>

        {#if data.userReview}
          <input form="remove-review" type="hidden" name="id" value={data.userReview.id} />
          <button
            aria-label="Supprimer l'avis"
            type="submit"
            form="remove-review"
            class="btn | bg-red-600 mx-0 p-2.5 hover:!bg-red-700"
          >
            <Trash aria-hidden="true" />
          </button>
        {/if}
      </div>
      <div class="grid gap-2.5 sm:grid-cols-4">
        <label class="flex flex-col gap-1 sm:col-span-3">
          <span>Votre commentaire</span>
          <textarea
            id="content"
            name="content"
            rows="5"
            required
            placeholder="J'adore cette recette..."
            class="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 resize-y"
            >{data.userReview?.content ?? ''}</textarea
          >
        </label>
        <label class="flex flex-col gap-1">
          <span>Votre note</span>
          <select
            id="rating"
            name="rating"
            required
            class="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600"
          >
            {#each data.allowedRatings as rating}
              <option value={rating} selected={rating === data.userReview?.rating}>
                {rating}
              </option>
            {/each}
          </select>
        </label>
      </div>

      {#if form?.reviewError}
        <p
          role="status"
          class="text-red-500 text-sm"
          in:fade={{ duration: prefersReducedMotion() ? 0 : 250 }}
        >
          {form.reviewError}
        </p>
      {/if}

      <button type="submit" class="btn | justify-center w-full sm:max-w-xs" aria-controls="reviews">
        Envoyer
      </button>
    </form>

    <div class="flex flex-col gap-2" id="reviews" role="region" aria-live="polite">
      {#each reviews as review (review.id)}
        {@const titleId = `review-${review.id}-title`}
        {@const contentId = `review-${review.id}-content`}
        {@const isAuthor = data.user.userId === review.user.id}

        <Card
          tabindex="0"
          containerClass={isAuthor ? 'border border-primary-600' : 'border border-gray-300'}
          aria-labelledby={titleId}
          aria-describedby={contentId}
        >
          <div class="flex gap-1 justify-between">
            <div class="flex flex-col gap-1">
              <h3 class="h3" id={titleId}>
                Avis de {review.user.username}
                <span aria-label="{review.rating} sur 5">({review.rating}/5)</span>
              </h3>
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
                <Trash aria-hidden="true" />
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
        <Loader message="Chargement des avis..." />
      {:else}
        <form
          action="?/loadReviews"
          method="post"
          use:infiniteScrollSubmit={{ disabled: !!form?.loadReviewsError }}
          use:enhance={() => {
            loading = true;

            return async ({ update }) => {
              await update({ invalidateAll: false });

              loading = false;
            };
          }}
        >
          <input type="hidden" name="cursor" value={reviews.at(-1)?.id} />

          <noscript>
            <button type="submit" aria-controls="reviews" class="btn | w-full">
              Charger plus d'avis
            </button>
          </noscript>
        </form>
      {/if}
    {/if}
  </section>
</div>

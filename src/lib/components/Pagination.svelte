<script lang="ts">
  import Back from '$lib/svg/Back.svelte';
  import First from '$lib/svg/First.svelte';
  import Forward from '$lib/svg/Forward.svelte';
  import Last from '$lib/svg/Last.svelte';

  /**
   * The current page number.
   */
  export let currentPage = 1;
  /**
   * The total number of pages.
   */
  export let totalPages = 1;
  /**
   * The number of pages to display before and after the current page.
   */
  export let pageDisplayRange = 3;
  /**
   * The URL to use for the pagination links.
   */
  export let url = '';
  /**
   * The name of the query parameter to use for the page number.
   */
  export let pageParam = 'page';

  $: previousPage = currentPage - 1 > 0 ? currentPage - 1 : currentPage;
  $: nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : currentPage;
  $: previousPages = Array.from(
    { length: pageDisplayRange },
    (_, index) => currentPage - (index + 1),
  )
    .filter((page) => page > 1)
    .reverse();
  $: nextPages = Array.from(
    { length: pageDisplayRange },
    (_, index) => currentPage + (index + 1),
  ).filter((page) => page < totalPages);
  $: canGoBack = currentPage > 1;
  $: canGoForward = currentPage < totalPages;

  const getUrlForPage = (page: number) => {
    const urlWithPage = new URL(url);
    urlWithPage.searchParams.set(pageParam, page.toString());

    return urlWithPage.toString();
  };
</script>

<nav aria-label="Pagination" {...$$restProps}>
  <ul class="inline-flex -space-x-px text-base h-10">
    <li>
      <a
        class="
          flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
          hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100 focus-visible:text-gray-700 rounded-s-lg
        "
        href={getUrlForPage(1)}
      >
        <First aria-hidden="true" />
        <span class="sr-only">Page 1 (première page)</span>
      </a>
    </li>

    <li>
      <a
        aria-current={canGoBack ? undefined : 'page'}
        aria-label={`Page précédente (page ${canGoBack ? previousPage : 'actuelle'})`}
        class="
          flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0
          border-gray-300 hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100 focus-visible:text-gray-700
        "
        href={getUrlForPage(previousPage)}
      >
        <Back aria-hidden="true" />
      </a>
    </li>

    {#if (previousPages.at(0) ?? 1) > 2}
      <li
        class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300"
        aria-hidden="true"
      >
        &#8230;
      </li>
    {/if}

    {#each previousPages as previousPageNumber}
      <li>
        <a
          class="
            flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
            hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100 focus-visible:text-gray-700
          "
          href={getUrlForPage(previousPageNumber)}
        >
          <span class="sr-only">Page </span>{previousPageNumber}
        </a>
      </li>
    {/each}

    <li class="z-10">
      <a
        aria-current="page"
        class="
          flex items-center justify-center px-4 h-10 leading-tight text-primary-600 border border-primary-300
          bg-primary-50 hover:bg-primary-100 hover:text-primary-700 focus-visible:bg-primary-100
        "
        href={getUrlForPage(currentPage)}
      >
        <span class="sr-only">Page </span>{currentPage}<span class="sr-only"> (page courante)</span>
      </a>
    </li>

    {#each nextPages as nextPageNumber}
      <li>
        <a
          class="
            flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
            hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100 focus-visible:text-gray-700
          "
          href={getUrlForPage(nextPageNumber)}
        >
          <span class="sr-only">Page </span>{nextPageNumber}
        </a>
      </li>
    {/each}

    {#if (nextPages.at(-1) ?? totalPages) < totalPages - 1}
      <li
        class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300"
        aria-hidden="true"
      >
        &#8230;
      </li>
    {/if}

    <li>
      <a
        aria-current={canGoForward ? undefined : 'page'}
        aria-label={`Page suivante (page ${canGoForward ? nextPage : 'actuelle'})`}
        class="
          flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
          hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100 focus-visible:text-gray-700
        "
        href={getUrlForPage(totalPages)}
      >
        <Forward aria-hidden="true" />
      </a>
    </li>

    <li>
      <a
        class="
          flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
          hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100 focus-visible:text-gray-700 rounded-e-lg
        "
        href={getUrlForPage(totalPages)}
      >
        <Last aria-hidden="true" />
        <span class="sr-only">Page {totalPages} (dernière page)</span>
      </a>
    </li>
  </ul>
</nav>

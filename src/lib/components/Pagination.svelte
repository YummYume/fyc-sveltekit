<script lang="ts">
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
  <ul class="flex gap-2 justify-center">
    <li>
      <a
        href={getUrlForPage(previousPage)}
        aria-current={canGoBack ? undefined : 'page'}
        aria-label={`Page précédente (page ${canGoBack ? previousPage : 'actuelle'})`}
      >
        Page précedente
      </a>
    </li>
    {#if canGoBack}
      <li>
        <a href={getUrlForPage(1)}>
          <span class="sr-only">Page </span>1<span class="sr-only"> (première page)</span>
        </a>
      </li>
    {/if}
    {#if (previousPages.at(0) ?? 1) > 2}
      <li aria-hidden="true">&#8230;</li>
    {/if}
    {#each previousPages as previousPageNumber}
      <li>
        <a href={getUrlForPage(previousPageNumber)}
          ><span class="sr-only">Page </span>{previousPageNumber}</a
        >
      </li>
    {/each}
    <li>
      <a href={getUrlForPage(currentPage)} aria-current="page">
        <span class="sr-only">Page </span>{currentPage}<span class="sr-only"> (page courante)</span>
      </a>
    </li>
    {#each nextPages as nextPageNumber}
      <li>
        <a href={getUrlForPage(nextPageNumber)}
          ><span class="sr-only">Page </span>{nextPageNumber}</a
        >
      </li>
    {/each}
    {#if (nextPages.at(-1) ?? totalPages) < totalPages - 1}
      <li aria-hidden="true">&#8230;</li>
    {/if}
    {#if canGoForward}
      <li>
        <a href={getUrlForPage(totalPages)}>
          <span class="sr-only">Page </span>{totalPages}<span class="sr-only">
            (dernière page)</span
          >
        </a>
      </li>
    {/if}
    <li>
      <a
        href={getUrlForPage(nextPage)}
        aria-current={canGoForward ? undefined : 'page'}
        aria-label={`Page suivante (page ${canGoForward ? nextPage : 'actuelle'})`}
      >
        Page suivante
      </a>
    </li>
  </ul>
</nav>

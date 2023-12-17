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
  <ul class="inline-flex -space-x-px text-base h-10">
    {#if canGoBack}
      <li>
        <a
          class="
          flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
          hover:bg-gray-100 hover:text-gray-700
        "
          class:rounded-s-lg={canGoBack}
          href={getUrlForPage(1)}
        >
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 12 16"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M1 1v14m8.336-.479-6.5-5.774a1 1 0 0 1 0-1.494l6.5-5.774A1 1 0 0 1 11 2.227v11.546a1 1 0 0 1-1.664.748Z"
            />
          </svg>
          <span class="sr-only">Page 1 (première page)</span>
        </a>
      </li>
    {/if}

    <li>
      <a
        class="
          flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0
          border-gray-300 hover:bg-gray-100 hover:text-gray-700
        "
        class:rounded-s-lg={!canGoBack}
        href={getUrlForPage(previousPage)}
      >
        <svg
          class="w-4 h-4"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
          />
        </svg>
        <span class="sr-only">Page précedente</span>
      </a>
    </li>

    {#if (previousPages.at(0) ?? 1) > 2}
      <li aria-hidden="true">&#8230;</li>
    {/if}

    {#each previousPages as previousPageNumber}
      <li>
        <a
          class="
            flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
            hover:bg-gray-100 hover:text-gray-700
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
          bg-primary-50 hover:bg-primary-100 hover:text-primary-700
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
            hover:bg-gray-100 hover:text-gray-700
          "
          href={getUrlForPage(nextPageNumber)}
        >
          <span class="sr-only">Page </span>{nextPageNumber}
        </a>
      </li>
    {/each}

    {#if (nextPages.at(-1) ?? totalPages) < totalPages - 1}
      <li aria-hidden="true">&#8230;</li>
    {/if}

    <li>
      <a
        class="
          flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
          hover:bg-gray-100 hover:text-gray-700
        "
        class:rounded-e-lg={!canGoForward}
        href={getUrlForPage(totalPages)}
      >
        <svg
          class="w-4 h-4"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
          />
        </svg>
        <span class="sr-only">Page suivante</span>
      </a>
    </li>

    {#if canGoForward}
      <li>
        <a
          class="
          flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300
          hover:bg-gray-100 hover:text-gray-700
        "
          class:rounded-e-lg={canGoForward}
          href={getUrlForPage(totalPages)}
        >
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 12 16"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 1v14m-8.336-.479 6.5-5.774a1 1 0 0 0 0-1.494l-6.5-5.774A1 1 0 0 0 1 2.227v11.546a1 1 0 0 0 1.664.748Z"
            />
          </svg>
          <span class="sr-only">Page {totalPages}(dernière page)</span>
        </a>
      </li>
    {/if}
  </ul>
</nav>

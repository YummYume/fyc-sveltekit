import type { ActionReturn } from 'svelte/action';

export type InfiniteScrollSubmitParams = {
  /**
   * Whether the infinite scroll is disabled
   */
  disabled: boolean;
  /**
   * The options for the IntersectionObserver
   */
  options?: IntersectionObserverInit;
};

/**
 * Automatically submit a form when into view for infinite scrolling
 *
 * @param node The form element
 * @param params Parameters for the action
 */
export const infiniteScrollSubmit = (
  node: HTMLFormElement,
  params: InfiniteScrollSubmitParams,
): ActionReturn<InfiniteScrollSubmitParams> => {
  let { disabled } = params;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !disabled) {
      node.requestSubmit();
    }
  }, params.options);

  observer.observe(node);

  return {
    update: (updatedParams) => {
      disabled = updatedParams.disabled;
    },
    destroy: () => {
      observer.disconnect();
    },
  };
};

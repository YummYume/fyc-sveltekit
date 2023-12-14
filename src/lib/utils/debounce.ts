import type { ActionReturn } from 'svelte/action';

export type InputDebounceParams = {
  /**
   * The value of the input
   */
  value: string;
  /**
   * The delay in milliseconds for the debounce
   */
  delay: number;
  /**
   * The callback to execute after the delay
   */
  callback: (value: string, node: HTMLInputElement) => void;
};

/**
 * Debounced input action
 *
 * @param node The input element
 * @param params Parameters for the action
 */
export const inputDebounce = (
  node: HTMLInputElement,
  params: InputDebounceParams,
): ActionReturn<InputDebounceParams> => {
  let timeout: number;

  return {
    update: (newParams) => {
      timeout = window.setTimeout(() => {
        params.callback(newParams.value, node);
      }, params.delay);
    },
    destroy: () => {
      window.clearTimeout(timeout);
    },
  };
};

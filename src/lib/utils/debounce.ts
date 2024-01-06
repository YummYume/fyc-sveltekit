import type { ActionReturn } from 'svelte/action';

export type InputDebounceParams = {
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
  let timeout: number | null = null;
  let eventParams = params;

  const callback = ({ target }: Event<EventTarget>) => {
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (timeout) {
      window.clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => {
      eventParams.callback(target.value, node);
    }, eventParams.delay);
  };

  node.addEventListener('input', callback);

  return {
    update: (newParams) => {
      eventParams = newParams;
    },
    destroy: () => {
      node.removeEventListener('input', callback);

      if (timeout) {
        window.clearTimeout(timeout);
      }
    },
  };
};

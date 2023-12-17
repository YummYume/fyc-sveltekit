import type { ActionReturn } from 'svelte/action';

import { browser } from '$app/environment';

export type ModalControlParams = {
  /**
   * Whether the modal is open or not
   */
  open?: boolean;
  /**
   * A callback to execute when close control is triggered
   */
  onClose?: () => void;
};

export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
];

/**
 * Specific controls used for modals
 *
 * @param node The modal element
 * @param params Parameters for the action
 */
export const modalControls = (
  node: HTMLElement,
  params?: ModalControlParams,
): ActionReturn<ModalControlParams> => {
  let callback = params?.onClose;
  let open = params?.open ?? false;

  const onTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }

    const focusableNodes = Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS.join(', ')),
    );
    const firstFocusableNode = focusableNodes.at(0);
    const lastFocusableNode = focusableNodes.at(-1);

    if (!firstFocusableNode || !lastFocusableNode) {
      return;
    }

    // If we are not within the focus trap, we focus the first element
    if (!node.contains(document.activeElement)) {
      e.preventDefault();

      if (e.shiftKey) {
        lastFocusableNode.focus();

        return;
      }

      firstFocusableNode.focus();

      return;
    }

    // If we are on the first focusable node and try to focus backward, we focus the last element instead
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableNode) {
        e.preventDefault();

        lastFocusableNode.focus();
      }

      return;
    }

    // If we are on the last focusable node and try to focus onward, we focus the first element instead
    if (document.activeElement === lastFocusableNode) {
      e.preventDefault();

      firstFocusableNode.focus();
    }
  };

  const onEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !callback) {
      return;
    }

    callback();
  };

  const focusFirstElement = () => {
    if (!open) {
      return;
    }

    const firstFocusableNode = node.querySelector<HTMLElement>(FOCUSABLE_ELEMENTS.join(', '));

    if (firstFocusableNode) {
      firstFocusableNode.focus();
    }
  };

  const handleWindowScroll = () => {
    if (!browser) {
      return;
    }

    if (open) {
      document.body.style.paddingRight = `${
        window.innerWidth - document.documentElement.clientWidth
      }px`;
      document.body.style.overflow = 'hidden';

      return;
    }

    document.body.style.paddingRight = '0px';
    document.body.style.overflow = 'auto';
  };

  if (browser) {
    window.addEventListener('keydown', onTab);
    window.addEventListener('keydown', onEscape);
  }

  focusFirstElement();
  handleWindowScroll();

  return {
    update: (newParams) => {
      callback = newParams.onClose;
      open = newParams.open ?? false;

      focusFirstElement();
      handleWindowScroll();
    },
    destroy: () => {
      open = false;

      handleWindowScroll();

      if (browser) {
        window.removeEventListener('keydown', onTab);
        window.removeEventListener('keydown', onEscape);
      }
    },
  };
};

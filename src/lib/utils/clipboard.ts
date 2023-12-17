import { toasts } from './toats';

import { browser } from '$app/environment';

export type CopyToClipboardOptions = {
  successMessage?: string;
  failureMessage?: string;
  accessDeniedMessage?: string;
  unsupportedMessage?: string;
};

/**
 * Copy a string to the clipboard
 *
 * @param value The string to copy
 * @param options Options to customize the toast messages
 */
export const copyToClipboard = (value: string, options?: CopyToClipboardOptions) => {
  const optionsWithDefaults = {
    successMessage: 'Copié dans le presse-papier.',
    failureMessage: 'Impossible de copier dans le presse-papier.',
    accessDeniedMessage:
      "Vous devez autoriser l'accès au presse-papier pour copier la liste de course.",
    unsupportedMessage: 'Votre navigateur ne supporte pas le presse-papier.',
    ...options,
  };

  if (!browser || !navigator.clipboard) {
    toasts.error(optionsWithDefaults.unsupportedMessage);

    return;
  }

  navigator.permissions
    // @ts-expect-error Clipboard permission API is not yet supported by TS
    .query({ name: 'clipboard-write' })
    .then((result) => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.clipboard.writeText(value).then(
          () => {
            toasts.success(optionsWithDefaults.successMessage);
          },
          () => {
            toasts.error(optionsWithDefaults.failureMessage);
          },
        );

        return;
      }

      toasts.error(optionsWithDefaults.accessDeniedMessage);
    })
    .catch((e) => {
      try {
        // This probably means 'clipboard-write' permission is not supported (e.g. Firefox)
        if (e.name === 'TypeError') {
          navigator.clipboard.writeText(value).then(
            () => {
              toasts.success(optionsWithDefaults.successMessage);
            },
            () => {
              toasts.error(optionsWithDefaults.failureMessage);
            },
          );

          return;
        }

        throw e;
      } catch (error) {
        toasts.error(optionsWithDefaults.failureMessage);
      }
    });
};

import { CARLOS_DEFAULT_ERROR_PROMPT, CARLOS_ERROR_PROMPT } from '$lib/server/GPT';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';

import type { Handle, HandleServerError } from '@sveltejs/kit';

const ERROR_MESSAGE: Record<'404' | '500' | string, string> = {
  404: "La page demandée n'existe pas.",
  500: 'Le serveur a rencontré un problème.',
};

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.db = db;
  event.locals.auth = auth.handleRequest(event);
  event.locals.session = await event.locals.auth.validate();

  return resolve(event);
};

export const handleError: HandleServerError = async ({ message, status }) => {
  let prompt = `L'utilisateur se trouve actuellement sur une page d'erreur ${status}.`;

  if (CARLOS_ERROR_PROMPT[status.toString()]) {
    prompt += CARLOS_ERROR_PROMPT[status.toString()];
  }

  prompt += CARLOS_DEFAULT_ERROR_PROMPT;

  return {
    message: ERROR_MESSAGE[status.toString()] || message,
    carlosContext: { prompt },
  };
};

import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.db = db;
  event.locals.auth = auth.handleRequest(event);
  event.locals.session = await event.locals.auth.validate();

  return resolve(event);
};

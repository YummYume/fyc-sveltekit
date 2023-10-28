import { fail, redirect } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';

import type { Actions } from './$types';

export const actions = {
  logout: async ({ locals, cookies }) => {
    if (!locals.session) {
      throw fail(401, { error: 'You are not logged in.' });
    }

    await auth.invalidateSession(locals.session.sessionId);

    const sessionCookie = auth.createSessionCookie(null);

    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    throw redirect(303, '/');
  },
} satisfies Actions;

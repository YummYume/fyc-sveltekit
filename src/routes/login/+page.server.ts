import { fail, redirect } from '@sveltejs/kit';
import { LuciaError } from 'lucia';

import { auth } from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load = (({ locals }) => {
  const user = locals.session?.user;

  if (user) {
    throw redirect(303, '/');
  }

  return {};
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = (data.get('username') ?? '') as string;
    const password = (data.get('password') ?? '') as string;

    if (username.length < 1 || password.length < 1 || password.length > 255) {
      return fail(400, { error: 'Invalid credentials.' });
    }

    try {
      const key = await auth.useKey('username', username.toLowerCase(), password);
      const session = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });
      const sessionCookie = auth.createSessionCookie(session);

      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (e) {
      if (e instanceof LuciaError && (e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')) {
        return fail(400, { error: 'Invalid credentials.' });
      }

      return fail(500, { error: 'Oops... Something went terribly wrong.' });
    }

    throw redirect(303, '/');
  },
} satisfies Actions;

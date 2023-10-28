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
  register: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = (data.get('username') ?? '') as string;
    const password = (data.get('password') ?? '') as string;
    const passwordRepeat = (data.get('password-repeat') ?? '') as string;

    if (username.length < 3) {
      return fail(422, { error: 'Username is too short. It must be at least 3 characters long.' });
    }

    if (password.length < 8) {
      return fail(422, { error: 'Password is too short. It must be at least 8 characters long.' });
    }

    if (password !== passwordRepeat) {
      return fail(422, { error: 'Passwords do not match.' });
    }

    try {
      const user = await auth.createUser({
        key: {
          providerId: 'username',
          providerUserId: username.toLowerCase(),
          password,
        },
        attributes: {
          username,
        },
      });
      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });
      const sessionCookie = auth.createSessionCookie(session);

      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (e) {
      if (e instanceof LuciaError && e.message === `AUTH_DUPLICATE_KEY_ID`) {
        return fail(400, { error: 'Username is already taken.' });
      }

      return fail(500, { error: 'Oops... Something went terribly wrong.' });
    }

    throw redirect(303, '/');
  },
} satisfies Actions;

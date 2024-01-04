import { fail, redirect } from '@sveltejs/kit';
import { LuciaError } from 'lucia';

import { auth } from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  return {
    seo: {
      title: 'Se connecter',
      meta: {
        description:
          'Connectez-vous à votre compte CookConnect pour accéder à toutes vos recettes.',
      },
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = (data.get('username') ?? '') as string;
    const password = (data.get('password') ?? '') as string;

    if (username.length < 1 || password.length < 1 || password.length > 255) {
      return fail(400, { error: 'Identifiants invalides.' });
    }

    try {
      const key = await auth.useKey('username', username.toLowerCase(), password);
      const newSession = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });
      const sessionCookie = auth.createSessionCookie(newSession);

      cookies.set(sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        path: sessionCookie.attributes.path ?? '/',
      });
    } catch (e) {
      if (
        e instanceof LuciaError &&
        (e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
      ) {
        return fail(400, { error: 'Identifiants invalides.' });
      }

      // eslint-disable-next-line no-console
      console.error('Error logging in:', e);

      return fail(500, {
        error: "Oups... Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
      });
    }

    redirect(303, '/');
  },
} satisfies Actions;

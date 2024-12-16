import { fail, redirect } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const { session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  return {
    seo: {
      title: 'CookConnect',
      meta: {
        description:
          "CookConnect, le moteur de recherche de recettes de cuisine, alimenté par l'intelligence artificielle.",
      },
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  logout: async ({ locals, cookies }) => {
    const { session } = locals;

    if (!session) {
      return fail(401, { error: "Vous n'êtes pas connecté." });
    }

    await auth.invalidateSession(session.sessionId);

    const sessionCookie = auth.createSessionCookie(null);

    cookies.set(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: sessionCookie.attributes.path ?? '/',
    });

    redirect(303, '/');
  },
} satisfies Actions;

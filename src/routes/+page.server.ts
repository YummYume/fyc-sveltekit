import { fail, redirect } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

export const load = (({ locals }) => {
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
    carlosContext: {
      prompt: `
        L'utilisateur se trouve actuellement sur la page "Accueil". Sa question peut donc (ou non) porter sur cette page.
        Cette page dispose d'une barre de recherche pour rechercher des recettes : si une recette est trouvée, l'utilisateur peut alors y accéder, sinon, l'utilisateur peut demander à générer la recette.
      `,
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  logout: async ({ locals, cookies }) => {
    if (!locals.session) {
      return fail(401, { error: "Vous n'êtes pas connecté." });
    }

    await auth.invalidateSession(locals.session.sessionId);

    const sessionCookie = auth.createSessionCookie(null);

    cookies.set(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: sessionCookie.attributes.path ?? '/',
    });

    redirect(303, '/');
  },
} satisfies Actions;

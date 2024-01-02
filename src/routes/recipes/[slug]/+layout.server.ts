import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { error, redirect } from '@sveltejs/kit';

import { CARLOS_DEFAULT_ERROR_PROMPT } from '$lib/server/GPT';

import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
  const { db, session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  try {
    const recipe = await db.recipe.findUniqueOrThrow({
      where: {
        slug: params.slug,
      },
    });

    return {
      recipe,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        error(404, {
          message: "Cette recette n'existe pas.",
          carlosContext: {
            prompt: `
              L'utilisateur se trouve actuellement sur une page d'erreur 404.
              Si l'utilisateur te sollicite, indique lui que la recette demandée n'existe pas.
              Demande à l'utilisateur de vérifier l'URL ou de retourner sur la page d'accueil.
              ${CARLOS_DEFAULT_ERROR_PROMPT}
            `,
          },
        });
      }
    }

    // eslint-disable-next-line no-console
    console.error('Error while loading recipe page:', e);

    throw e;
  }
}) satisfies LayoutServerLoad;

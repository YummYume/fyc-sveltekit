import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
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
        });
      }
    }

    // eslint-disable-next-line no-console
    console.error('Error while loading recipe page:', e);

    throw e;
  }
}) satisfies LayoutServerLoad;

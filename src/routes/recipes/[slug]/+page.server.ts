import { db } from '$lib/server/db';
import { jsonValueToArray } from '$lib/utils/json';

import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const { recipe } = await parent();

  return {
    recipe: {
      ...recipe,
      ingredients: jsonValueToArray(recipe.ingredients),
      steps: jsonValueToArray(recipe.steps),
      shoppingList: jsonValueToArray(recipe.shoppingList),
    },
    isFavourite: false,
    seo: {
      title: recipe.dish,
      meta: {
        description: recipe.description,
      },
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  favourite: async ({ params }) => {
    // Get favourite
    const favourite = await db.favourite.findFirst({
      where: {
        recipe: {
          slug: params.slug,
        },
        userId: '1',
      },
      include: {
        recipe: true,
      },
    });

    // Remove favourite
    if (favourite) {
      await db.favourite.delete({
        where: {
          id: favourite.id,
        },
      });

      return {};
    }

    // Add favourite
    await db.favourite.create({
      data: {
        user: {
          connect: {
            id: '1',
          },
        },
        recipe: {
          connect: {
            slug: params.slug,
          },
        },
      },
    });

    return {};
  },
};

import { error, fail } from '@sveltejs/kit';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ locals, params }) => {
  const { db } = locals;

  const recipe = await db.recipe.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      favourites: true,
    },
  });

  if (!recipe) {
    throw error(404, 'Recipe not found');
  }

  const getData = async () => {
    const favourite = await db.favourite.findFirst({
      where: {
        recipe_id: recipe.id,
        user_id: locals.session?.user.userId,
      },
    });

    return {
      isFavourite: !!favourite,
      recipe,
    };
  };

  return {
    streamed: { result: getData() },
  };
}) satisfies PageServerLoad;

export const actions = {
  favourite: async ({ locals, request }) => {
    const { db, session } = locals;

    const data = await request.formData();

    const recipe = data.get('recipe') as string;

    if (!recipe) {
      return fail(400, { error: 'Wrong recipe id' });
    }

    const recipeId = parseInt(recipe, 10);

    // Get favourite
    const favourite = await db.favourite.findFirst({
      where: {
        recipe_id: recipeId,
        user_id: session?.user.userId,
      },
    });

    // Remove favourite
    if (favourite) {
      await db.favourite.delete({
        where: {
          id: favourite.id,
        },
      });

      return { status: 204 };
    }

    // Add favourite
    await db.favourite.create({
      data: {
        user: {
          connect: {
            id: session?.user.userId,
          },
        },
        recipe: {
          connect: {
            id: recipeId,
          },
        },
      },
    });

    return { status: 201 };
  },
};

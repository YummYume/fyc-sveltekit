import { MAKE_RECIPE, queryGPT } from '$lib/server/GPT';
import { slugify } from '$lib/utils/functions.js';

import type { PageServerLoad } from '../$types.js';
import type { JsonValue } from '@prisma/client/runtime/library.js';

type Recipe = {
  description: string;
  dish: string;
  ingredients: JsonValue;
  slug: string;
  steps: JsonValue;
};

export const load = (async ({ locals, url }) => {
  const { db } = locals;

  const dish = url.searchParams.get('dish') ?? '';

  const getRecipe = async (): Promise<Recipe> => {
    let recipe;

    const pageRecipe = await db.recipe.findUnique({
      where: {
        slug: dish,
      },
    });

    if (!pageRecipe) {
      recipe = await queryGPT({ inputSystem: MAKE_RECIPE, inputUser: dish }, false).then((e) =>
        JSON.parse(e.choices[0].message.content ?? ''),
      );
    }

    return (
      pageRecipe ??
      db.recipe.create({
        data: {
          ...recipe,
          slug: slugify(recipe.dish),
        },
      })
    );
  };

  return {
    streamed: {
      recipe: getRecipe(),
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  favourite: async ({ locals, request }) => {
    const { db, session } = locals;

    // const { dish } = (await request.formData()).get('recipe');

    // const favourite = await db.favourite.create({
    //   data: {
    //     users: {
    //       connect: [{ id: session?.userId }],
    //     },
    //     recipes: {
    //       connect: [{ slug: dish }],
    //     },
    //   },
    // });
  },
};

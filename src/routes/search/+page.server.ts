import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Redirect_1, fail, redirect } from '@sveltejs/kit';

import { MAKE_RECIPE, getRecipe, queryGPT } from '$lib/server/GPT';
import { slugify } from '$lib/utils/functions';

import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
  const { db } = locals;
  const search = (url.searchParams.get('q') ?? '') as string;

  const recipes = await db.recipe.findMany({
    select: {
      id: true,
      dish: true,
    },
    where: {
      dish: {
        search,
      },
    },
  });

  return {
    streamed: {
      dish: search,
      result: queryGPT({ inputSystem: getRecipe(recipes), inputUser: search }, false),
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  generate: async ({ locals, request }) => {
    const { db } = locals;
    const data = await request.formData();

    const recipe = (data.get('recipe') ?? '') as string;

    const recipeGenerated = await queryGPT({ inputSystem: MAKE_RECIPE, inputUser: recipe }, false);

    const recipeParsed = JSON.parse(recipeGenerated.choices[0].message.content ?? '');

    try {
      const recipeCreated = await db.recipe.create({
        select: {
          slug: true,
        },
        data: {
          ...recipeParsed,
          slug: slugify(recipeParsed.dish),
        },
      });

      throw redirect(303, `/recipes/${recipeCreated.slug}`);
    } catch (e) {
      if (e.status === 303) {
        throw e;
      }

      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return fail(400, { error: 'Recipe already exists.' });
      }

      return fail(500, { error: 'Oops... Something went terribly wrong.' });
    }
  },
};

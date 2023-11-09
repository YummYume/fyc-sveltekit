import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fail, redirect } from '@sveltejs/kit';

import { MAKE_RECIPE, getRecipe, queryGPT } from '$lib/server/GPT';
import { slugify } from '$lib/utils/functions';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ url, locals }) => {
  const { db } = locals;
  const search = url.searchParams.get('q') ?? '';

  const recipes = await db.recipe.findMany({
    select: {
      dish: true,
      slug: true,
    },
    where: {
      dish: {
        search,
      },
    },
  });

  const result = queryGPT({ inputSystem: getRecipe(recipes), inputUser: search }, false).then(
    (res) => JSON.parse(res.choices[0].message.content ?? ''),
  );

  return {
    streamed: {
      dish: search,
      result,
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  generate: async ({ locals, request }) => {
    const { db } = locals;
    const data = await request.formData();
    const dish = (data.get('dish') ?? '') as string;
    const recipeGenerated = await queryGPT({ inputSystem: MAKE_RECIPE, inputUser: dish }, false);
    const recipeParsed = JSON.parse(recipeGenerated.choices[0].message.content ?? '');

    try {
      await db.recipe.create({
        select: {
          slug: true,
        },
        data: {
          ...recipeParsed,
          slug: slugify(recipeParsed.dish),
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return fail(400, { error: 'Recipe already exists.' });
      }

      return fail(500, { error: 'Oops... Something went terribly wrong.' });
    }

    throw redirect(303, `/recipes/${slugify(recipeParsed.dish)}`);
  },
};

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fail, redirect } from '@sveltejs/kit';

import { MAKE_RECIPE, getRecipe, queryGPT } from '$lib/server/GPT';
import { slugify } from '$lib/utils/slug';

import type { Recipe } from '$lib/server/types.js';
import type { PageServerLoad } from './$types.js';

export const load = (async ({ url, locals }) => {
  const { db, session } = locals;

  if (!session) {
    throw redirect(303, '/login');
  }

  const query = url.searchParams.get('q') ?? '';

  const getResult = async () => {
    const recipes = await db.recipe.findMany({
      select: {
        dish: true,
        slug: true,
      },
      where: {
        dish: {
          search: query,
        },
      },
    });

    const output = queryGPT({ inputSystem: getRecipe(recipes), inputUser: query }, false);
    const result: { recipe: Recipe | null; suggestions: Recipe[] } = await output.then((res) =>
      JSON.parse(res.choices[0].message.content ?? ''),
    );

    // Remove non-existing recipes
    result.recipe = recipes.find((r) => r.slug === result.recipe?.slug) ?? null;

    result.suggestions = recipes.reduce((acc, curr) => {
      const suggestion = recipes.find((r) => r.slug === curr.slug);

      if (suggestion) {
        acc.push(suggestion);
      }

      return acc;
    }, [] as Recipe[]);

    return result;
  };

  return {
    query,
    streamed: {
      result: getResult(),
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  generate: async ({ locals, request }) => {
    const { db } = locals;
    const data = await request.formData();
    const dish = (data.get('dish') ?? '') as string;
    const result = await queryGPT({ inputSystem: MAKE_RECIPE, inputUser: dish }, false);

    const recipe = JSON.parse(result.choices[0].message.content ?? '');

    if (!recipe) {
      return fail(404, { error: "Votre demande n'est pas valide. Veuillez réessayer." });
    }

    try {
      await db.recipe.create({
        select: {
          slug: true,
        },
        data: {
          ...recipe,
          slug: slugify(recipe.dish),
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return fail(400, { error: 'Cette recette existe déjà.' });
      }

      // eslint-disable-next-line no-console
      console.error('Error creating recipe:', e);

      return fail(500, {
        error: "Oops... Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
      });
    }

    throw redirect(303, `/recipes/${slugify(recipe.dish)}`);
  },
};

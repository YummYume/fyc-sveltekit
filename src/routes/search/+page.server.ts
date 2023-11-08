import { getRecipe, queryGPT } from '$lib/server/GPT';

import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
  const { db } = locals;
  const search = url.searchParams.get('q') ?? '';

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

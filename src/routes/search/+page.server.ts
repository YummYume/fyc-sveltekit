import { foundARecipe, queryGPT } from '$lib/server/GPT';

import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
  const { db } = locals;
  const queryParams = url.searchParams.get('q') ?? '';

  const recipes = await db.recipe.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      name: {
        search: queryParams,
      },
    },
  });

  console.log(recipes);

  return {
    streamed: {
      result: queryGPT({ inputSystem: foundARecipe(recipes), inputUser: `${queryParams}` }, false),
    },
  };
}) satisfies PageServerLoad;

import { MAKE_RECIPE, queryGPT } from '$lib/server/GPT';

import type { PageServerLoad } from '../$types';

export const load = (async ({ locals, url }) => {
  const { db } = locals;
  const queryParams = url.searchParams.get('dish') ?? '';

  return {
    streamed: {
      result: queryGPT({ inputSystem: MAKE_RECIPE, inputUser: queryParams }, false),
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  CreateFavourite: async (e) => {
    const favourite = await db.favourite.create({
      data: {
        users: {
          connect: [{ id: locals.session?.userId }],
        },
        recipes: {
          connect: [{ slug: queryParams }],
        },
      },
    });
  },
};

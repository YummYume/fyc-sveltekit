import { MAKE_RECIPE, queryGPT } from '$lib/server/GPT';

import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
  const queryParams = url.searchParams.get('dish') ?? '';

  return {
    streamed: {
      result: queryGPT({ inputSystem: MAKE_RECIPE, inputUser: queryParams }, false),
    },
  };
}) satisfies PageServerLoad;

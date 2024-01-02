import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {
    user: {
      username: 'Carlos',
      disallowedIngredients: 'chocolat',
    },
  };
}) satisfies PageServerLoad;

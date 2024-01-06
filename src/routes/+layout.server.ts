import type { LayoutServerLoad } from './$types';

export const load = (async () => {
  return {
    user: {
      username: 'Carlos',
      disallowedIngredients: ['chocolat'],
    },
  };
}) satisfies LayoutServerLoad;

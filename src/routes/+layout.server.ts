import type { LayoutServerLoad } from './$types';

export const load = (async () => {
  return {
    user: {
      username: 'Carlos',
      disallowedIngredients: ['chocolat'],
    },
    seo: {
      title: 'CookConnect',
      meta: {
        description: 'The CookConnect app.',
      },
    },
  };
}) satisfies LayoutServerLoad;

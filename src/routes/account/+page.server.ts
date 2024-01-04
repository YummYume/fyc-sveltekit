import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {
    user: {
      username: 'Carlos',
      disallowedIngredients: 'chocolat',
    },
    seo: {
      title: 'Mon profil',
      meta: {
        description: 'Modifiez votre profil sur CookConnect.',
      },
    },
  };
}) satisfies PageServerLoad;

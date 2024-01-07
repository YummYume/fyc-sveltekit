import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {
    seo: {
      title: 'CookConnect',
      meta: {
        description:
          "CookConnect, le moteur de recherche de recettes de cuisine, alimenté par l'intelligence artificielle.",
      },
    },
  };
}) satisfies PageServerLoad;

import type { PageServerLoad } from './$types';
import type { Favourite, Recipe } from '@prisma/client';

const ALLOWED_PER_PAGE = [10, 25, 50, 100];

export const load = (async () => {
  return {
    count: 0,
    favourites: [] as (Favourite & { recipe: Recipe })[],
    allowedPerPage: ALLOWED_PER_PAGE,
    perPage: ALLOWED_PER_PAGE[0],
    totalPages: 1,
    currentPage: 1,
    seo: {
      title: 'Mes favoris',
      meta: {
        description: 'Retrouvez vos recettes favorites sur CookConnect.',
      },
    },
  };
}) satisfies PageServerLoad;

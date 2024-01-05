import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

const ALLOWED_PER_PAGE = [10, 25, 50, 100];

export const load = (async ({ locals }) => {
  const { session, db } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  const [favourites, count] = await Promise.all([
    db.favourite.findMany({
      where: {
        userId: session.user.userId,
      },
      include: {
        recipe: true,
      },
    }),
    db.favourite.count({
      where: {
        userId: session.user.userId,
      },
    }),
  ]);

  return {
    favourites,
    count,
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

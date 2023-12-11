import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
  const { db, session } = locals;

  if (!session) {
    throw redirect(303, '/login');
  }

  const allowedPerPage = [10, 25, 50, 100];
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  let perPage = parseInt(url.searchParams.get('perPage') ?? allowedPerPage[0].toString(), 10);

  if (!allowedPerPage.includes(perPage)) {
    [perPage] = allowedPerPage;
  }

  const [favourites, count] = await db.$transaction([
    db.favourite.findMany({
      where: {
        user_id: session.user.userId,
      },
      include: {
        recipe: true,
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.favourite.count({
      where: {
        user_id: session.user.userId,
      },
    }),
  ]);

  return {
    favourites,
    count,
    totalPages: Math.ceil(count / perPage),
    currentPage: page,
    perPage,
    seo: {
      title: 'Mes favoris',
      meta: {
        description: 'Retrouvez vos recettes favorites sur CookConnect.',
      },
    },
  };
}) satisfies PageServerLoad;

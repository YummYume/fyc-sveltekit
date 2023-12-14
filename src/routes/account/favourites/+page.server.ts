import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

const ALLOWED_PER_PAGE = [10, 25, 50, 100];

export const load = (async ({ locals, url }) => {
  const { db, session } = locals;

  if (!session) {
    throw redirect(303, '/login');
  }

  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const query = url.searchParams.get('query') ?? '';
  const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  let perPage = parseInt(url.searchParams.get('perPage') ?? ALLOWED_PER_PAGE[0].toString(), 10);

  if (!ALLOWED_PER_PAGE.includes(perPage)) {
    [perPage] = ALLOWED_PER_PAGE;
  }

  const [favourites, count] = await Promise.all([
    db.favourite.findMany({
      where: {
        userId: session.user.userId,
        recipe: {
          dish: {
            contains: query,
          },
        },
      },
      orderBy: {
        recipe: {
          dish: order,
        },
      },
      include: {
        recipe: true,
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.favourite.count({
      where: {
        userId: session.user.userId,
        recipe: {
          dish: {
            contains: query,
          },
        },
      },
    }),
  ]);

  let prompt = `
    L'utilisateur consulte actuellement la page "Favoris" qui contient la liste de ses recettes favorites.
    Sa question peut donc (ou non) porter sur cette page.
  `;

  if (count === 0) {
    prompt += `
      L'utilisateur n'a actuellement aucune recette favorite.
      S'il te demande de l'aide, propose-lui d'ajouter une recette à ses favoris.
      S'il te demande comment générer des recettes, explique-lui qu'il doit se rendre sur la page principale et chercher une recette.
      S'il te demande comment ajouter une recette à ses favoris, explique-lui qu'il doit se rendre sur la page d'une recette et cliquer sur l'étoile à droite du titre de la recette.
    `;
  } else {
    prompt += `
      L'utilisateur a actuellement ${count} recettes favorites, dont ${
        favourites.length
      } sont affichées sur cette page.
      Voici les recettes favorites de l'utilisateur affichées sur la page : ${favourites
        .map((favourite) => favourite.recipe.dish)
        .toString()}. Chaque recette est séparée par une virgule.
    `;
  }

  return {
    favourites,
    count,
    allowedPerPage: ALLOWED_PER_PAGE,
    totalPages: Math.ceil(count / perPage),
    currentPage: page,
    perPage,
    query,
    order,
    seo: {
      title: 'Mes favoris',
      meta: {
        description: 'Retrouvez vos recettes favorites sur CookConnect.',
      },
    },
    carlosContext: {
      prompt,
    },
  };
}) satisfies PageServerLoad;

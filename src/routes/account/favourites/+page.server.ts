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
    perPage: ALLOWED_PER_PAGE[0],
    totalPages: 1,
    currentPage: 1,
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

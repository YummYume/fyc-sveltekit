import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { error, redirect } from '@sveltejs/kit';

import { openai, CARLOS_DEFAULT_ERROR_PROMPT } from '$lib/server/GPT.js';
import { jsonValueToArray } from '$lib/utils/json.js';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ locals, params }) => {
  const { db, session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  try {
    const recipe = await db.recipe.findUniqueOrThrow({
      where: {
        slug: params.slug,
      },
    });

    const getSimilarRecipes = async () => {
      const recipes = await db.recipe.findMany({
        select: {
          dish: true,
          slug: true,
          description: true,
        },
        where: {
          slug: {
            not: {
              equals: recipe.slug,
            },
          },
        },
      });

      const prompt = `
        Tu es Carlos, un assistant culinaire du site "CookConnect".
        La recette que tu consultes actuellement est "${recipe.dish}".
        Je vais te donner une liste de recettes et ton travail est de me donner les recettes qui sont les plus adaptées pour être recommandées en tant que "recettes similaires".
        Tu peux me donner entre 0 et 3 recettes.
        Je veux le résultat au format JSON, comme suit : ["slug1", "slug2", "slug3"].
        Attention, tu dois me donner des recettes qui ne contiennent pas ce genre d'ingrédients : ${
          session.user.ingredients
        }.
        Voici la liste des recettes : ${JSON.stringify(recipes)}.
      `;

      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        stream: false,
      });

      const slugs = jsonValueToArray(JSON.parse(result.choices[0].message.content ?? ''));

      return recipes.filter((similarRecipe) => slugs.includes(similarRecipe.slug));
    };

    return {
      similarRecipes: getSimilarRecipes(),
      recipe,
      seo: {
        title: `${recipe.dish}, recettes similaires`,
        meta: {
          description: `Recettes similaires à la recette "${recipe.dish}".`,
        },
      },
      carlosContext: {
        prompt: `
          L'utilisateur consulte actuellement les recettes similaires à la recette "${recipe.dish}".
          Sa question peut donc (ou non) porter sur cette recette ou sur cette page.
          Cette page est une page secondaire qui ne liste que les recettes similaires à la recette "${recipe.dish}".
          Elle peut également s'ouvrir dans une modal. Si l'utilisateur te pose plus de questions sur cette page, tu peux lui demander de d'abord revenir sur la page principale de la recette "${recipe.dish}" pour plus d'informations.
        `,
      },
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        error(404, {
          message: "Cette recette n'existe pas.",
          carlosContext: {
            prompt: `
              L'utilisateur se trouve actuellement sur une page d'erreur 404.
              Si l'utilisateur te sollicite, indique lui que la recette demandée n'existe pas.
              Demande à l'utilisateur de vérifier l'URL ou de retourner sur la page d'accueil.
              ${CARLOS_DEFAULT_ERROR_PROMPT}
            `,
          },
        });
      }
    }

    throw e;
  }
}) satisfies PageServerLoad;

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

    const getAccompaniments = async () => {
      const prompt = `
        Tu es Carlos, un assistant culinaire du site "CookConnect".
        La recette actuellement consultée est "${recipe.dish}".
        Ton travail consiste à me donner une liste d'accompagnements pour cette recette.
        Je veux le résultat au format JSON, comme suit : ["accompagnement1", "accompagnement2", "accompagnement3"].
        ${
          session.user.disallowedIngredients
            ? `Attention, tu dois me donner des accompagnements qui ne contiennent pas ce genre ingrédients : ${session.user.disallowedIngredients}.`
            : ''
        }
        Tu peux me donner au maximum 10 accompagnements.
      `;

      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        stream: false,
      });

      return jsonValueToArray(JSON.parse(result.choices[0].message.content ?? ''));
    };

    return {
      accompaniments: getAccompaniments(),
      recipe,
      seo: {
        title: `${recipe.dish}, accompagnements`,
        meta: {
          description: `Accompagnements proposés pour la recette "${recipe.dish}".`,
        },
      },
      carlosContext: {
        prompt: `
          L'utilisateur consulte actuellement les accompagnements de la recette "${recipe.dish}".
          Sa question peut donc (ou non) porter sur cette recette ou sur cette page.
          Cette page est une page secondaire qui ne liste que les accompagnements de la recette "${recipe.dish}".
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

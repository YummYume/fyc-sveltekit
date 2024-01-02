import { redirect } from '@sveltejs/kit';

import { openai } from '$lib/server/GPT.js';
import { jsonValueToArray } from '$lib/utils/json.js';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ locals, parent }) => {
  const { db, session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  const { recipe } = await parent();

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
      ${
        session.user.disallowedIngredients
          ? `
            Attention, tu dois me donner des recettes qui ne contiennent pas ce genre d'ingrédients : ${session.user.disallowedIngredients}.
            Les ingrédients à éviter sont séparés par une virgule. Si une valeur n'est pas un ingrédient valide, tu peux l'ignorer.
          `
          : ''
      }
      Voici la liste des recettes : ${JSON.stringify(recipes)}
    `;

    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
      stream: false,
    });

    const slugs = jsonValueToArray(JSON.parse(result.choices[0].message.content ?? ''));

    return recipes.filter((similarRecipe) => slugs.includes(similarRecipe.slug)).slice(0, 3);
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
}) satisfies PageServerLoad;

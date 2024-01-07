import { redirect } from '@sveltejs/kit';

import { openai } from '$lib/server/GPT';
import { jsonValueToArray } from '$lib/utils/json';

import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
  const { session, db } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  const { recipe } = await parent();
  const favourite = await db.favourite.findFirst({
    where: {
      recipeId: recipe.id,
      userId: locals.session?.user.userId,
    },
  });

  const checkDisallowedIngredients = async (): Promise<string[] | null> => {
    if (session.user.disallowedIngredients && recipe.ingredients) {
      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        stream: false,
        messages: [
          {
            role: 'system',
            content: `
                Voici une liste d'ingrédients à éviter: ${session.user.disallowedIngredients}.
                Les ingrédients à éviter sont séparés par une virgule. Si une valeur n'est pas un ingrédient valide, tu peux l'ignorer.
                Si dans la recette que je te donne, il y a au moins un ingrédient de cette liste ou du même genre, tu me renvoies un objet JSON avec le format suivant :
                {
                  "disallowedIngredients": string[],
                },
                où "disallowedIngredients" contiendra la liste des ingrédients à éviter que tu as trouvé dans la recette.
                Si tu ne trouves pas d'ingrédients à éviter, "disallowedIngredients" sera un tableau vide.
              `,
          },
          {
            role: 'user',
            content: recipe.ingredients.toString(),
          },
        ],
      });

      const { disallowedIngredients } = JSON.parse(result.choices[0].message.content ?? '');

      return disallowedIngredients.length > 0 ? disallowedIngredients : null;
    }

    return null;
  };

  return {
    disallowedIngredients: checkDisallowedIngredients(),
    recipe: {
      ...recipe,
      ingredients: jsonValueToArray(recipe.ingredients),
      steps: jsonValueToArray(recipe.steps),
      shoppingList: jsonValueToArray(recipe.shoppingList),
    },
    isFavourite: !!favourite,
    seo: {
      title: recipe.dish,
      meta: {
        description: recipe.description,
      },
    },
    carlosContext: {
      prompt: `
        L'utilisateur consulte actuellement la recette "${recipe.dish}".
        Sa question peut donc (ou non) porter sur cette recette ou sur cette page.
        L'utilisateur peut consulter les avis (avec notes) de la recette.
        L'utilisateur peut ajouter, éditer ou supprimer son avis (avec une note) sur la recette.
        L'utilisateur peut ajouter ou retirer la recette de ses favoris en cliquant sur l'étoile à droite du titre de la recette.
        La recette ${favourite ? 'est' : "n'est pas"} dans les favoris de l'utilisateur.
        L'utilisateur peut aussi demander des recettes similaires et des accompagnements personnalisés pour la recette en cliquant sur les boutons correspondants. Ce n'est pas obligatoire et ce n'est pas toi qui gère ces fonctionnalités. Tu peux simplement indiquer leur présence à l'utilisateur s'il te pose une question sur des recettes similaires ou des accompagnements personnalisés.
        Si une question porte sur une étape ou un ingrédient, focalise-toi sur cette étape ou cet ingrédient.
        Voici les ingrédients de la recette : ${recipe.ingredients?.toString()}. Chaque ingrédient est séparé par une virgule.
        Voici les étapes de la recette : ${recipe.steps?.toString()}. Chaque étape est séparée par une virgule.
        Voici la description de la recette : ${recipe.description}.
      `,
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  favourite: async ({ params, locals }) => {
    const { session, db } = locals;

    if (!session) {
      redirect(303, '/login');
    }

    // Get favourite
    const favourite = await db.favourite.findFirst({
      where: {
        recipe: {
          slug: params.slug,
        },
        userId: session.user.userId,
      },
      include: {
        recipe: true,
      },
    });

    // Remove favourite
    if (favourite) {
      await db.favourite.delete({
        where: {
          id: favourite.id,
        },
      });

      return {};
    }

    // Add favourite
    await db.favourite.create({
      data: {
        user: {
          connect: {
            id: session.user.userId,
          },
        },
        recipe: {
          connect: {
            slug: params.slug,
          },
        },
      },
    });

    return {};
  },
};

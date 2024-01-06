import { openai } from '$lib/server/GPT';
import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

type Dish = {
  dish: string;
  slug: string;
};

export const load = (async ({ url }) => {
  const query = url.searchParams.get('q') ?? '';

  const getResult = async (): Promise<{ recipe: null | Dish; suggestions: Dish[] }> => {
    const recipes = await db.recipe.findMany({
      select: {
        dish: true,
        slug: true,
        description: true,
      },
    });

    if (recipes.length === 0 || !query) {
      return {
        recipe: null,
        suggestions: [],
      };
    }

    const output = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: false,
      messages: [
        {
          role: 'system',
          content: `
            TU NE DOIS RETOURNER QUE DU JSON.
            À partir de maintenant, tu es un assistant de cuisine personnel.
            Ceci est la liste de recettes de cuisine dont tu disposes, au format JSON : ${JSON.stringify(
              recipes,
            )}.
            Ton but est de chercher dans la liste de recettes de cuisine une recette qui correspond à la demande de l'utilisateur parmi les recettes que tu as. Tu dois te contenter de chercher dans la liste de recettes que tu as et ne peux pas en inventer de nouvelles.
            L'utilisateur peut te demander le nom d'un plat mais aussi le nom d'un ingrédient, une description de ce qu'il souhaite manger, ou une demande pour une occasion spéciale. Il peut également te demander une recette aléatoire.
            Tu peux ne pas trouver de recette, ce n'est pas grave, retourne {"recipe": null, "suggestions": []} et ignore de la demande de l'utilisateur.
            Si tu juges que la demande de l'utilisateur n'est pas valide, est obscène, insultante, ou ne correspond pas à une recette de cuisine, retourne {"recipe": null, "suggestions": []} et ignore la demande.
            Que tu trouves une recette ou non, tu peux également donner des suggestions (entre 0 et 10) de recettes qui pourraient répondre à la demande de l'utilisateur. Les suggestions doivent être des recettes qui ont un rapport avec la demande de l'utilisateur ou qui ressemblent à la recette que tu as trouvée (si tu en as trouvée une).
            Tu peux ne pas donner de suggestions si tu n'en trouves pas.
            Retourne le résultat au format JSON suivant :
            {
              "recipe": {"dish": string, "slug": slug}|null,
              "suggestions": {"dish": string, "slug": slug}[],
            }
          `,
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });
    try {
      const result: { recipe: Dish | null; suggestions: Dish[] } = JSON.parse(
        output.choices[0].message.content ?? '',
      );

      // Remove non-existing recipes
      result.recipe = recipes.find((r) => r.slug === result.recipe?.slug) ?? null;
      result.suggestions = result.suggestions.reduce<Dish[]>((suggestions, suggestion) => {
        const recipe = recipes.find((r) => r.slug === suggestion.slug);

        if (
          recipe &&
          recipe.slug !== result.recipe?.slug &&
          !suggestions.some((r) => r.slug === recipe.slug) &&
          suggestions.length < 10
        ) {
          suggestions.push(recipe);
        }

        return suggestions;
      }, []);

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error searching for recipe:', e);

      throw e;
    }
  };

  return {
    result: getResult(),
    query,
  };
}) satisfies PageServerLoad;

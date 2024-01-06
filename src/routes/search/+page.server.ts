import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fail, redirect } from '@sveltejs/kit';

import { openai } from '$lib/server/GPT';
import { slugify } from '$lib/utils/slug';

import type { PageServerLoad } from './$types';

type Dish = {
  dish: string;
  slug: string;
};

export const load = (async ({ url, locals }) => {
  const { session, db } = locals;

  if (!session) {
    redirect(303, '/login');
  }

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
    seo: {
      title: 'Recherche de recettes',
      meta: {
        description: 'Recherchez une recette sur CookConnect.',
      },
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  generate: async ({ request, locals }) => {
    const { session, db } = locals;

    if (!session) {
      redirect(303, '/login');
    }

    const data = await request.formData();
    const dish = (data.get('dish') ?? '') as string;
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: false,
      messages: [
        {
          role: 'system',
          content: `
            TU NE DOIS RETOURNER QUE DU JSON.
            À partir de maintenant, tu es un assistant de cuisine personnel.
            Je vais te donner une demande utilisateur, et tu me donneras une recette de cuisine pour cette dernière en français.
            Si l'utilisateur demande le nom d'un plat, alors tu dois générer une recette pour ce plat.
            Si l'utilisateur demande le nom d'un ingrédient, une description de ce qu'il souhaite manger, ou une recette pour une occasion spéciale, alors tu dois générer une recette qui correspond à cette demande.
            Ton but final est uniquement de générer une recette de cuisine si possible. Cette recette pourra ensuite être consultée par n'importe quel utilisateur, il n'y a pas de lien entre la demande de l'utilisateur et la recette générée.
            Si tu juges que la demande ne peut pas être satisfaite, ce n'est pas grave, retourne "null" et ignore la demande. N'essaie pas de générer une recette qui n'existe pas ou qui n'a pas de sens.
            Si tu juges que la demande de l'utilisateur n'est pas valide, est obscène, insultante, ou ne correspond pas à une recette de cuisine, retourne "null" et ignore la demande.
            Sinon, donne-moi une recette, et formate ta sortie en JSON avec le format suivant :
            {
              "description": string,
              "dish": string,
              "ingredients": string[],
              "shoppingList": string[],
              "slug": string,
              "steps": string[]
            }
          `,
        },
        {
          role: 'user',
          content: dish,
        },
      ],
    });
    const recipe = JSON.parse(result.choices[0].message.content ?? '');

    if (!recipe) {
      return fail(400, { error: "Votre demande n'est pas valide. Veuillez réessayer." });
    }

    try {
      await db.recipe.create({
        select: {
          slug: true,
        },
        data: {
          ...recipe,
          slug: slugify(recipe.dish),
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return fail(400, { error: 'Cette recette existe déjà.' });
      }

      // eslint-disable-next-line no-console
      console.error('Error creating recipe:', e);

      return fail(500, {
        error: "Oups... Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
      });
    }

    redirect(303, `/recipes/${slugify(recipe.dish)}`);
  },
};

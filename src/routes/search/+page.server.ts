import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fail, redirect } from '@sveltejs/kit';

import { openai } from '$lib/server/GPT';
import { slugify } from '$lib/utils/slug';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ url, locals }) => {
  const { db, session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  const query = url.searchParams.get('q') ?? '';

  const getResult = async () => {
    const recipes = await db.recipe.findMany({
      select: {
        dish: true,
        slug: true,
      },
      where: {
        dish: {
          search: query,
        },
      },
    });

    const output = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: false,
      messages: [
        {
          role: 'system',
          content: `
            À partir de maintenant, tu es mon assistant de cuisine personnel.
            Ceci est une liste de recettes de cuisine autorisées au format JSON : "${JSON.stringify(
              recipes,
            )}",
            si la liste est vide, retourne ce JSON : {"recipe": null, "suggestions": []} et ignore le reste de mon message,
            sinon, je vais te demander un plat spécifique à manger, et tu me donneras une recette de cuisine pour celui-ci, mais seulement si tu trouves la recette de cuisine dans la liste que je t'ai donnée.
            Sors en JSON la recette avec des suggestions de recettes similaires comme ceci :
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
    const result = JSON.parse(output.choices[0].message.content ?? '');

    // Remove non-existing recipes
    result.recipe = recipes.find((r) => r.slug === result.recipe?.slug) ?? null;
    result.suggestions = recipes.reduce<
      {
        dish: string;
        slug: string;
      }[]
    >((acc, curr) => {
      const suggestion = recipes.find(
        (r) => r.slug === curr.slug && !acc.includes(r) && r.slug !== result.recipe?.slug,
      );

      if (suggestion) {
        acc.push(suggestion);
      }

      return acc;
    }, []);

    return result;
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
    carlosContext: {
      prompt: `
        L'utilisateur consulte actuellement la page "Recherche" qui contient la liste des recettes correspondant à sa recherche.
        Sa question peut donc (ou non) porter sur cette page.
        Si une recette est trouvée, l'utilisateur peut alors y accéder, sinon, l'utilisateur peut demander à générer la recette.
        L'utilisateur peut également bénéficier de suggestions de recettes.
        La recherche de l'utilisateur est : ${query}.
      `,
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  generate: async ({ locals, request }) => {
    const { db } = locals;
    const data = await request.formData();
    const dish = (data.get('dish') ?? '') as string;
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: false,
      messages: [
        {
          role: 'system',
          content: `
            Je vais te donner une phrase, et tu me donneras une recette de cuisine pour celle-ci en français.
            Si tu ne trouves pas de recette, retourne "null" et ignore le reste de mon message.
            Sinon, donne-moi une recette, et formate ta sortie en JSON comme ceci :
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

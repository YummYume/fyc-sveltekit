import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { error, fail, redirect } from '@sveltejs/kit';

import { CARLOS_DEFAULT_ERROR_PROMPT, openai } from '$lib/server/GPT.js';
import { jsonValueToArray } from '$lib/utils/json.js';

import type { PageServerLoad } from './$types.js';

const ALLOWED_RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

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

    const [favourite, userReview, { _avg, _count }] = await Promise.all([
      db.favourite.findFirst({
        where: {
          recipeId: recipe.id,
          userId: locals.session?.user.userId,
        },
      }),
      db.review.findFirst({
        where: {
          recipeId: recipe.id,
          userId: locals.session?.user.userId,
        },
      }),
      db.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
        where: {
          recipeId: recipe.id,
        },
      }),
    ]);

    const checkDisallowedIngredients = async (): Promise<string[] | null> => {
      if (session.user.ingredients && recipe.ingredients) {
        const result = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          stream: false,
          messages: [
            {
              role: 'system',
              content: `
                Voici une liste d'ingrédients : ${session.user.ingredients}, si dans la recette que je te donne, il y a au moins un ingrédient de cette liste ou du même genre, tu me renvoies un JSON : 
                {
                  "disallowedIngredients": string[],
                }, 
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
      isFavourite: !!favourite,
      recipe: {
        ...recipe,
        ingredients: jsonValueToArray(recipe.ingredients),
        steps: jsonValueToArray(recipe.steps),
        shoppingList: jsonValueToArray(recipe.shoppingList),
      },
      userReview,
      user: session.user,
      allowedRatings: ALLOWED_RATINGS,
      reviewCount: _count.rating,
      reviewAverage: _avg.rating,
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
          L'utilisateur ${userReview ? 'a mis un avis' : "n'a pas mis d'avis"} sur la recette${
            userReview ? ` : "${userReview.rating}/5"` : ''
          }.
          L'utilisateur peut ajouter ou retirer la recette de ses favoris en cliquant sur l'étoile à droite du titre de la recette.
          La recette ${favourite ? 'est' : "n'est pas"} dans les favoris de l'utilisateur.
          Si une question porte sur une étape ou un ingrédient, focalise-toi sur cette étape ou cet ingrédient.
          Voici les ingrédients de la recette : ${recipe.ingredients?.toString()}. Chaque ingrédient est séparé par une virgule.
          Voici les étapes de la recette : ${recipe.steps?.toString()}. Chaque étape est séparée par une virgule.
          Voici la description de la recette : ${recipe.description}.
          Voici la note moyenne de la recette : ${_avg.rating ?? '-'}/5 pour un total de ${
            _count.rating
          } avis.
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

export const actions = {
  favourite: async ({ locals, params }) => {
    const { db, session } = locals;

    if (!session) {
      redirect(303, '/login');
    }

    // Get favourite
    const favourite = await db.favourite.findFirst({
      where: {
        recipe: {
          slug: params.slug,
        },
        userId: session?.user.userId,
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
            id: session?.user.userId,
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
  review: async ({ locals, request, params }) => {
    const { db, session } = locals;

    if (!session) {
      redirect(303, '/login');
    }

    const body = await request.formData();
    const content = body.get('content') ?? null;
    const rating = body.get('rating') ?? null;

    if (typeof content !== 'string') {
      return fail(400, { reviewError: "Le contenu de l'avis ne doit pas être vide." });
    }

    if (content.length < 1 || content.length > 255) {
      return fail(400, {
        reviewError: "Le contenu de l'avis doit être compris entre 1 et 255 caractères.",
      });
    }

    if (typeof rating !== 'string') {
      return fail(400, { reviewError: 'La note ne doit pas être vide.' });
    }

    const ratingValue = parseFloat(rating);

    if (Number.isNaN(ratingValue) || !ALLOWED_RATINGS.includes(ratingValue)) {
      return fail(400, {
        reviewError: `La note doit être l'une des valeurs suivantes : ${ALLOWED_RATINGS.join(
          ', ',
        )}.`,
      });
    }

    const review = await db.review.findFirst({
      where: {
        recipe: {
          slug: params.slug,
        },
        userId: session.user.userId,
      },
    });

    if (review) {
      const updatedReview = await db.review.update({
        where: {
          id: review.id,
        },
        data: {
          content,
          rating: ratingValue,
        },
        include: {
          user: true,
        },
      });

      return { review: updatedReview };
    }

    const newReview = await db.review.create({
      data: {
        content,
        rating: ratingValue,
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
      include: {
        user: true,
      },
    });

    return {
      review: newReview,
    };
  },
  removeReview: async ({ locals, request }) => {
    const { db, session } = locals;

    if (!session) {
      redirect(303, '/login');
    }

    const formData = await request.formData();
    const id = formData.get('id') ?? null;

    if (typeof id !== 'string') {
      return fail(400, {
        removeReviewError: 'Le paramètre "id" doit être une chaîne de caractères.',
      });
    }

    const reviewId = parseInt(id, 10);

    if (Number.isNaN(reviewId)) {
      return fail(400, { removeReviewError: 'Le paramètre "id" doit être un nombre entier.' });
    }

    const review = await db.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return fail(404, {
        removeReviewError: "Cet avis n'existe pas.",
      });
    }

    if (review.userId !== session.user.userId) {
      return fail(403, {
        removeReviewError: "Vous n'êtes pas l'auteur de cet avis.",
      });
    }

    const removedReview = await db.review.delete({
      where: {
        id: reviewId,
      },
    });

    return { removedReview };
  },
  loadReviews: async ({ locals, request, params }) => {
    const { db, session } = locals;

    if (!session) {
      redirect(303, '/login');
    }

    const formData = await request.formData();
    const cursor = formData.get('cursor') ?? null;

    if (cursor !== null && typeof cursor !== 'string') {
      return fail(400, {
        loadReviewsError: 'Le paramètre "cursor" doit être une chaîne de caractères.',
      });
    }

    const id = cursor ? parseInt(cursor, 10) : null;

    return {
      reviews: await db.review.findMany({
        take: 10,
        skip: id ? 1 : 0,
        cursor: id ? { id } : undefined,
        include: {
          user: true,
        },
        where: {
          recipe: {
            slug: params.slug,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    };
  },
};

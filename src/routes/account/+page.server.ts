import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

type UserData = {
  username?: string;
  ingredients?: string;
};

export const load = (({ locals }) => {
  const { session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  return {
    user: session.user,
    seo: {
      title: 'Mon profil',
      meta: {
        description: 'Modifiez votre profil sur CookConnect.',
      },
    },
    carlosContext: {
      prompt: `
        L'utilisateur se trouve actuellement sur la page "Profil" qui contient les informations de son profil.
        Sa question peut donc (ou non) porter sur cette page.
        L'utilisateur peut modifier son nom d'utilisateur ainsi que les ingrédients qu'il souhaite ne pas utiliser.
      `,
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ locals, request }) => {
    const { db, session } = locals;
    const data = await request.formData();

    if (!session) {
      redirect(303, '/login');
    }

    const userData: UserData = {};

    const username = data.get('username') as string;
    const ingredients = data.get('ingredients') as string;

    if (username && username !== '') {
      if (!/^[A-Za-z]+$/g.test(username)) {
        return fail(422, {
          error: "Le nom d'utilisateur ne doit contenir que des lettres.",
        });
      }

      if (username.length < 3 || username.length > 20) {
        return fail(400, {
          error: "Le nom d'utilisateur doit être compris entre 3 et 20 caractères.",
        });
      }

      userData.username = username;
    }

    if (ingredients) {
      if (!/[a-zA-Z,]/.test(ingredients)) {
        return fail(422, {
          error: 'Les ingrédients ne doivent contenir que des lettres et des virgules.',
        });
      }

      userData.ingredients = ingredients;
    }

    try {
      await db.user.update({
        where: {
          id: session?.user.userId,
        },
        data: userData,
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return fail(400, { error: "le nom d'utilisateur est déjà utilisé." });
      }

      return fail(500, {
        error: "Oops... Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
      });
    }
  },
};

import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
  const { session } = locals;

  if (!session) {
    throw redirect(303, '/login');
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

import { error } from '@sveltejs/kit';

import { RECIPES } from '$lib/server/db';

import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
  const recipe = RECIPES.find((definedRecipe) => definedRecipe === params.slug);

  if (!recipe) {
    error(404, "Cette recette n'existe pas.");
  }

  return {
    recipe,
  };
}) satisfies LayoutServerLoad;

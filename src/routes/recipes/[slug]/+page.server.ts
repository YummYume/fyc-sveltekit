import { jsonValueToArray } from '$lib/utils/json';

import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const { recipe } = await parent();

  return {
    recipe: {
      ...recipe,
      ingredients: jsonValueToArray(recipe.ingredients),
      steps: jsonValueToArray(recipe.steps),
      shoppingList: jsonValueToArray(recipe.shoppingList),
    },
    isFavourite: false,
  };
}) satisfies PageServerLoad;

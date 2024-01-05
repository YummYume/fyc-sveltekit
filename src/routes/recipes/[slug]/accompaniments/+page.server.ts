import { redirect } from '@sveltejs/kit';

import { openai } from '$lib/server/GPT';
import { jsonValueToArray } from '$lib/utils/json';

import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
  const { session } = locals;

  if (!session) {
    redirect(303, '/login');
  }

  const { recipe } = await parent();

  const getAccompaniments = async () => {
    const prompt = `
      Tu es Carlos, un assistant culinaire du site "CookConnect".
      La recette actuellement consultée est "${recipe.dish}".
      Ton travail consiste à me donner une liste d'accompagnements pour cette recette.
      Je veux le résultat au format JSON, comme suit : ["accompagnement1", "accompagnement2", "accompagnement3"].
      Tu peux me donner au maximum 10 accompagnements.
    `;

    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
      stream: false,
    });

    return jsonValueToArray(JSON.parse(result.choices[0].message.content ?? '')).slice(0, 10);
  };

  return {
    accompaniments: getAccompaniments(),
    recipe,
    seo: {
      title: `${recipe.dish}, accompagnements personnalisés`,
      meta: {
        description: `Accompagnements personnalisés proposés pour la recette "${recipe.dish}".`,
      },
    },
  };
}) satisfies PageServerLoad;

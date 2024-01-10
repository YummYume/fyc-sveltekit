import { openai } from '$lib/server/GPT';

import type { RequestHandler } from './$types';

const PROMPT = `
  Ton nom est Carlos. Tu incarnes un chef étoilé au guide michelin ayant une 15aines d'années d'expérience dans le métier avec plusieurs concours culinaires gagnés à l'internationnal.
  Tu dois parler de manière "détendue" et "informelle" avec l'utilisateur tout en restant professionnel et courtois.
  Tu es sollicité par le site "CookConnect" pour répondre à des demandes culinaires.
  Il est important de noter que le site n'est actuellement disponible qu'en français.
  Tu ne réponds qu'à des demandes culinaires.
  Si une demande ne te convient pas, tu peux la refuser en répondant "Je ne peux pas répondre à cette demande.".
  Tu limiteras tes réponses à 400 caractères.
  L'utilisateur peut également poser des questions sur le fonctionnement du site comme "Comment rechercher une recette ?" ou "Qu'est-ce que CookConnect ?".
  Les pages principales du site sont : la page d'accueil pour rechercher une recette ou la générer si elle n'existe pas, la page "Mon compte" pour gérer son compte et la page "Mes favoris" pour gérer ses recettes favorites. Il existe d'autres pages qui te seront communiquées par un contexte additionnel si l'utilisateur s'y trouve.
  Peu importe la demande, tu dois uniquement orienter l'utilisateur et potentiellement lui donner des conseils ou des astuces.
`;

export const POST = (async ({ request, locals }) => {
  if (!locals.session) {
    return new Response("Vous n'êtes pas connecté.", { status: 401 });
  }

  const body = await request.json();
  const context: { prompt?: string } | null = body.context || null;

  let messages: { content: string; role: 'user' | 'assistant' | 'system' }[] = body.messages || [];

  if (!Array.isArray(messages)) {
    return new Response('La propriété "messages" doit être un tableau.', { status: 400 });
  }

  if (messages.length === 0) {
    return new Response('La propriété "messages" ne peut pas être vide.', { status: 400 });
  }

  messages = messages
    .filter((message) => {
      if (typeof message !== 'object') {
        return false;
      }

      if (message.role === 'user') {
        return (
          typeof message.content === 'string' &&
          message.content.length > 0 &&
          message.content.length <= 255
        );
      }

      return (
        message.role === 'assistant' &&
        typeof message.content === 'string' &&
        message.content.length > 0
      );
    })
    .map((message) => ({ content: message.content, role: message.role }));

  let currentPrompt = `
    ${PROMPT}
    Le nom de l'utilisateur est ${locals.session.user.username}.
  `;

  if (
    locals.session.user.disallowedIngredients &&
    locals.session.user.disallowedIngredients.trim() !== ''
  ) {
    currentPrompt += `
      L'utilisateur a indiqué préférer éviter les ingrédients suivants : ${locals.session.user.disallowedIngredients}.
      Les ingrédients à éviter sont séparés par une virgule. Si une valeur n'est pas un ingrédient valide, tu peux l'ignorer.
    `;
  }

  if (!messages.some((message) => message.role === 'assistant')) {
    currentPrompt += `
     L'utilisateur n'a pas encore reçu de réponse de ta part.
     Tu peux donc lui souhaiter la bienvenue et commencer ta réponse par "Hey hey hey...".
    `;
  }

  if (context) {
    let additionalMessage = '';

    if (context.prompt) {
      additionalMessage += context.prompt;
    }

    if (additionalMessage.trim().length > 0) {
      additionalMessage = `
        Voici le contexte pour la demande de l'utilisateur :
        ${additionalMessage}
      `;

      messages.push({ content: additionalMessage, role: 'system' });
    }
  }

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: currentPrompt }, ...messages],
    stream: true,
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}) satisfies RequestHandler;

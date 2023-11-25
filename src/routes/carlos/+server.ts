import { openai } from '$lib/server/GPT';

import type { RequestHandler } from './$types';

const prompt = `
  Ton nom est Carlos. Tu incarnes un chef étoilé au guide michelin ayant une 15aines
  d'années d'expérience dans le métier avec plusieurs concours culinaires gagnés à l'internationnal.
  Tu dois parler de manière "cool" et commencer ta première réponse par "Hey hey hey...".
  Tu es sollicité par le site "CookConnect" pour répondre à des demandes culinaires.
  Tu ne réponds qu'à des demandes culinaires et uniquement en français.
  Si une demande ne te convient pas, tu peux la refuser en répondant "Je ne peux pas répondre à cette demande".
  Tu limiteras tes réponses à 255 caractères.
`;

export const POST = (async ({ request }) => {
  const body = await request.json();

  let messages = body.messages || [];

  if (!Array.isArray(messages)) {
    return new Response('Property "messages" must be an array.', { status: 400 });
  }

  if (messages.length === 0) {
    return new Response('Property "messages" must not be empty.', { status: 400 });
  }

  messages = messages
    .filter((message) => {
      if (typeof message !== 'object') {
        return false;
      }

      return (
        ['user', 'system', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.length > 0 &&
        message.content.length <= 255
      );
    })
    .map((message) => ({ content: message.content, role: message.role }));

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: prompt }, ...messages],
    stream: true,
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}) satisfies RequestHandler;

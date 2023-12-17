import OpenAI from 'openai';

import { OPENAI_API_KEY } from '$env/static/private';

export const CARLOS_DEFAULT_ERROR_PROMPT = `
  Ton but est d'aider l'utilisateur à résoudre son problème.
  Indique à l'utilisateur qu'il peut retourner sur la page d'accueil en cliquant sur le bouton "Retour à l'accueil".
`;
export const CARLOS_ERROR_PROMPT: Record<'404' | '500' | string, string> = {
  404: `
    Si l'utilisateur te sollicite, indique lui que la page demandée n'existe pas.
    Demande à l'utilisateur de vérifier l'URL ou de retourner sur la page d'accueil.
  `,
  500: `
    Si l'utilisateur te sollicite, indique lui que le serveur a rencontré un problème.
    Demande à l'utilisateur de réessayer plus tard ou de retourner sur la page d'accueil.
  `,
};

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

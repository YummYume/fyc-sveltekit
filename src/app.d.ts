import type { Auth as AuthType } from '$lib/server/auth';
import type { PageData as AccompanimentsPageData } from './routes/recipes/[slug]/accompaniments/$types';
import type { PageData as SimilarRecipesPageData } from './routes/recipes/[slug]/similar/$types';
import type { PrismaClient } from '@prisma/client';
import type { AuthRequest, Session } from 'lucia';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string;
      carlosContext?: {
        prompt: string;
      };
    }
    interface Locals {
      db: PrismaClient;
      auth: AuthRequest;
      session: Session | null;
    }
    interface PageData {
      seo?: {
        title?: string;
        meta?: {
          description?: string;
          [key: string]: string;
        };
      };
      carlosContext?: {
        prompt: string;
      };
    }
    interface PageState {
      accompaniments?: Omit<AccompanimentsPageData, 'accompaniments'> & {
        accompaniments: Awaited<AccompanimentsPageData['accompaniments']>;
      };
      similarRecipes?: Omit<SimilarRecipesPageData, 'similarRecipes'> & {
        similarRecipes: Awaited<SimilarRecipesPageData['similarRecipes']>;
      };
    }
    // interface Platform {}
  }

  namespace Lucia {
    type Auth = AuthType;
    type DatabaseUserAttributes = {
      username: string;
      disallowedIngredients: string;
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    type DatabaseSessionAttributes = {};
  }
}

export {};

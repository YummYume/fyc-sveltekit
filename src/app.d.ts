import type { Auth as AuthType } from '$lib/server/auth';
import type { PrismaClient } from '@prisma/client';
import type { AuthRequest, Session } from 'lucia';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
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
    // interface Platform {}
  }

  namespace Lucia {
    type Auth = AuthType;
    type DatabaseUserAttributes = {
      username: string;
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    type DatabaseSessionAttributes = {};
  }
}

export {};

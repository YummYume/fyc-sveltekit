import type { Auth as AuthType } from '$lib/server/auth';
import type Database from 'bun:sqlite';
import type { AuthRequest, Session } from 'lucia';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: Database;
      auth: AuthRequest;
      session: Session | null;
    }
    // interface PageData {}
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

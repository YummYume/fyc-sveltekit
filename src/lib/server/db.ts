import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export const RECIPES = ['pizza', 'pâtes', 'salade', 'soupe', 'tarte'];

import type { ValueOf } from '$lib/types/utils';

const seasons = {
  winter: 'hiver',
  spring: 'printemps',
  summer: 'été',
  autumn: 'automne',
} as const;

const monthsSeasons = {
  '1': seasons.winter,
  '2': seasons.winter,
  '3': seasons.winter,
  '4': seasons.spring,
  '5': seasons.spring,
  '6': seasons.spring,
  '7': seasons.summer,
  '8': seasons.summer,
  '9': seasons.summer,
  '10': seasons.autumn,
  '11': seasons.autumn,
  '12': seasons.autumn,
};

export type Season = ValueOf<typeof seasons>;
export type Month = keyof typeof monthsSeasons;

export const getCurrentMonth = (): Month =>
  new Date().toLocaleString(undefined, { month: 'numeric' }) as Month;

export const getCurrentSeason = (): Season => monthsSeasons[getCurrentMonth()];

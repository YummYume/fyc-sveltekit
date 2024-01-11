import type { ValueOf } from '$lib/types/utils';

const seasons = {
  winter: 'hiver',
  spring: 'printemps',
  summer: 'été',
  autumn: 'automne',
} as const;

const monthsSeasons = {
  December: seasons.winter,
  January: seasons.winter,
  February: seasons.winter,
  March: seasons.spring,
  April: seasons.spring,
  May: seasons.spring,
  June: seasons.summer,
  July: seasons.summer,
  August: seasons.summer,
  September: seasons.autumn,
  October: seasons.autumn,
  November: seasons.autumn,
};

export type Season = ValueOf<typeof seasons>;
export type Month = keyof typeof monthsSeasons;

export const getCurrentMonth = (): Month =>
  new Date().toLocaleString('gb-GB', { month: 'long' }) as Month;

export const getCurrentSeason = (): Season => monthsSeasons[getCurrentMonth()];

const seasons = {
  winter: ['December', 'January', 'February'],
  spring: ['March', 'April', 'May'],
  summer: ['June', 'July', 'August'],
  fall: ['September', 'October', 'November'],
}

type Season = keyof typeof seasons;

export const getCurrentMonth = () => (new Date()).toLocaleString('fr-FR', { month: 'long' });

export const getCurrentSeason = (): Season | null => {
  const currentMonth = getCurrentMonth();
  const season = Object.entries(seasons).find(([, months]) => months.includes(currentMonth));

  return season ? season[0] as Season : null;
}
export function shouldRevealNextOre(previousOreLevel: number, coins: number, nextOreCost: number): boolean {
  return previousOreLevel > 0 && coins >= nextOreCost / 2;
}

export function getChanceText(chancePercent: number): string {
  return chancePercent < 0.1 ? chancePercent.toFixed(3) : chancePercent.toFixed(2);
}

import type { GameState, OreType, ResourceConfig, UpgradeConfig, UpgradableOre } from "./game-types";
import { DEFAULT_RESOURCES } from "./resources";

interface CreateResourceLogicArgs {
  state: GameState;
  resourceLegendBody: HTMLElement | null;
  getUpgradeCost: (config: UpgradeConfig, owned: number) => number;
  round: (value: number, digits?: number) => number;
  getChanceText: (chancePercent: number) => string;
}

export function createResourceLogic(args: CreateResourceLogicArgs): {
  getResourceByOre: (ore: OreType) => ResourceConfig;
  getOreGenerationLevel: (ore: UpgradableOre) => number;
  setOreGenerationLevel: (ore: UpgradableOre, level: number) => void;
  getOreWeightForLevel: (ore: OreType, level: number) => number;
  getOreGenerationCost: (ore: UpgradableOre) => number;
  getOreEffectiveWeight: (ore: OreType) => number;
  rollTileType: () => OreType;
  rollTileTypeWithBoostedOre: (boostedOre: UpgradableOre, qualityMultiplier: number) => OreType;
  getTileCoinValue: (tileType: OreType) => number;
  getOreDisplayName: (ore: OreType) => string;
  renderResourceLegend: () => void;
  getOreGenerationStatText: (ore: UpgradableOre) => string;
} {
  const { state, resourceLegendBody, getUpgradeCost, round, getChanceText } = args;

  function getOreUpgradeConfig(ore: UpgradableOre): UpgradeConfig {
    const resource = state.resources.find((entry) => entry.ore === ore);
    return {
      baseCost: resource?.baseCost || 0,
      growth: resource?.growth || 1,
    };
  }

  function getResourceByOre(ore: OreType): ResourceConfig {
    const resource = state.resources.find((entry) => entry.ore === ore);
    if (resource) {
      return resource;
    }

    const fallback = DEFAULT_RESOURCES.find((entry) => entry.ore === ore);
    if (fallback) {
      return { ...fallback };
    }

    return {
      ore,
      name: ore.charAt(0).toUpperCase() + ore.slice(1),
      weight: 0,
      value: 1,
      baseCost: 0,
      growth: 1,
      resourceLevel: 0,
    };
  }

  function getOreGenerationLevel(ore: UpgradableOre): number {
    return getResourceByOre(ore).resourceLevel;
  }

  function setOreGenerationLevel(ore: UpgradableOre, level: number): void {
    const resource = state.resources.find((entry) => entry.ore === ore);
    if (resource) {
      resource.resourceLevel = Math.max(0, level);
    }
  }

  function getOreWeightForLevel(ore: OreType, level: number): number {
    const baseWeight = getResourceByOre(ore).weight;
    if (ore === "sand") {
      return baseWeight;
    }
    if (level <= 0) {
      return 0;
    }
    return baseWeight * 1.2 ** (level - 1);
  }

  function getOreGenerationCost(ore: UpgradableOre): number {
    return getUpgradeCost(getOreUpgradeConfig(ore), getOreGenerationLevel(ore));
  }

  function getOreEffectiveWeight(ore: OreType): number {
    const level = ore === "sand" ? 1 : getOreGenerationLevel(ore);
    return getOreWeightForLevel(ore, level);
  }

  function getWeightedRoll(boostedOre: UpgradableOre | null, qualityMultiplier: number): OreType {
    const weights: Array<{ ore: OreType; weight: number }> = [
      { ore: "sand", weight: getOreEffectiveWeight("sand") },
      { ore: "coal", weight: getOreEffectiveWeight("coal") },
      { ore: "copper", weight: getOreEffectiveWeight("copper") },
      { ore: "iron", weight: getOreEffectiveWeight("iron") },
      { ore: "silver", weight: getOreEffectiveWeight("silver") },
      { ore: "gold", weight: getOreEffectiveWeight("gold") },
    ];

    if (boostedOre) {
      for (const entry of weights) {
        if (entry.ore === boostedOre) {
          entry.weight *= qualityMultiplier;
          break;
        }
      }
    }

    const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of weights) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.ore;
      }
    }

    return "sand";
  }

  function rollTileType(): OreType {
    return getWeightedRoll(null, 1);
  }

  function rollTileTypeWithBoostedOre(boostedOre: UpgradableOre, qualityMultiplier: number): OreType {
    return getWeightedRoll(boostedOre, qualityMultiplier);
  }

  function getTileCoinValue(tileType: OreType): number {
    return getResourceByOre(tileType).value || 1;
  }

  function getOreDisplayName(ore: OreType): string {
    return getResourceByOre(ore).name;
  }

  function renderResourceLegend(): void {
    if (!resourceLegendBody) {
      return;
    }

    const weights = state.resources.map((resource) => ({ ore: resource.ore, weight: getOreEffectiveWeight(resource.ore) }));
    const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0);

    resourceLegendBody.innerHTML = weights
      .map(({ ore, weight }) => {
        const chancePercent = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
        const chanceText = getChanceText(chancePercent);
        return `<p class="resource-legend-row"><span>${getOreDisplayName(ore)}</span><span>${chanceText}%</span><span>${getTileCoinValue(ore)}</span></p>`;
      })
      .join("");
  }

  function getOreGenerationStatText(ore: UpgradableOre): string {
    const currentLevel = getOreGenerationLevel(ore);
    const currentWeight = getOreWeightForLevel(ore, currentLevel);
    const nextWeight = getOreWeightForLevel(ore, currentLevel + 1);
    if (currentLevel <= 0) {
      return `Locked. Weight: 0 → ${round(nextWeight, 2).toLocaleString()} on first upgrade`;
    }
    return `Weight: ${round(currentWeight, 2).toLocaleString()} → ${round(nextWeight, 2).toLocaleString()} (+20%)`;
  }

  return {
    getResourceByOre,
    getOreGenerationLevel,
    setOreGenerationLevel,
    getOreWeightForLevel,
    getOreGenerationCost,
    getOreEffectiveWeight,
    rollTileType,
    rollTileTypeWithBoostedOre,
    getTileCoinValue,
    getOreDisplayName,
    renderResourceLegend,
    getOreGenerationStatText,
  };
}

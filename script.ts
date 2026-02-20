import {
  BASE_MINER_EFFECT_RADIUS_PX,
  MIN_TILE_COVERAGE_IN_RADIUS,
  SAVE_KEY,
  SPECIALIZATION_COST,
} from "./game-constants";
import {
  clamp,
  getDefaultMinerPosition,
  getTileBoundsByIndex,
  getTileCoverageInMinerRadius,
} from "./map-geometry";
import type {
  GameState,
  MinerTargeting,
  OreType,
  Position,
  ResourceConfig,
  Unit,
  UnitSpecialization,
  UpgradeConfig,
  UpgradableOre,
} from "./game-types";
import { createDefaultResources, DEFAULT_RESOURCES } from "./resources";
import { clearSavedGame, loadGameState, saveGameState } from "./persistence";
import { getChanceText, shouldRevealNextOre } from "./rendering";
import { runIdleMinersLoop } from "./game-loop";
import { renderResourceStatsPanelView, renderUpgradesAccordionView } from "./ui-renderers";
import { renderMinerPopupView, renderMinerStatsPanelView } from "./ui-miner-panels";
import { bindUiEvents } from "./ui-events";
import {
  buildSpecializationData,
  getDefaultSpecializationData,
  getSpecializationLabel,
  normalizeSpecialization,
} from "./unit-specialization";

interface InteractionState {
  activeMinerIndex: number | null;
  selectedMinerIndex: number | null;
  repositionMode: boolean;
  placementMode: boolean;
  upgradesAccordionOpen: boolean;
  upgradePanelOpen: boolean;
  statsPanelOpen: boolean;
  resourceStatsOpen: boolean;
  oreCopperRevealed: boolean;
  oreIronRevealed: boolean;
  oreSilverRevealed: boolean;
  oreGoldRevealed: boolean;
}

interface UIElements {
  coins: HTMLElement | null;
  perSecond: HTMLElement | null;
  idleMinerCost: HTMLElement | null;
  idleMinerOwned: HTMLElement | null;
  settingsToggle: HTMLElement | null;
  settingsModal: HTMLElement | null;
  upgradesAccordionBody: HTMLElement | null;
  toggleUpgradesAccordion: HTMLButtonElement | null;
  buyIdleMiner: HTMLButtonElement | null;
  save: HTMLButtonElement | null;
  reset: HTMLButtonElement | null;
  mapEnvironment: HTMLElement | null;
  mapSize: HTMLElement | null;
  resourceStatsPanel: HTMLElement | null;
  resourceStatsToggle: HTMLButtonElement | null;
  closeResourceStatsButton: HTMLButtonElement | null;
  resourceLegendBody: HTMLElement | null;
  mapGrid: HTMLElement | null;
  minerRing: HTMLElement | null;
  mapExpandCost: HTMLElement | null;
  mapExpansions: HTMLElement | null;
  expandMap: HTMLButtonElement | null;
  status: HTMLElement | null;
  minerPopup: HTMLElement | null;
  minerPopupTitle: HTMLElement | null;
  popupUpgradeSpeed: HTMLButtonElement | null;
  popupUpgradeRadius: HTMLButtonElement | null;
  popupSpeedCost: HTMLElement | null;
  popupRadiusCost: HTMLElement | null;
  popupSpeedLevel: HTMLElement | null;
  popupRadiusLevel: HTMLElement | null;
  popupReposition: HTMLButtonElement | null;
  coalGenerationCost: HTMLElement | null;
  coalGenerationLevel: HTMLElement | null;
  coalGenerationStat: HTMLElement | null;
  buyCoalGeneration: HTMLButtonElement | null;
  copperGenerationCost: HTMLElement | null;
  copperGenerationLevel: HTMLElement | null;
  copperGenerationStat: HTMLElement | null;
  buyCopperGeneration: HTMLButtonElement | null;
  ironGenerationCost: HTMLElement | null;
  ironGenerationLevel: HTMLElement | null;
  ironGenerationStat: HTMLElement | null;
  buyIronGeneration: HTMLButtonElement | null;
  silverGenerationCost: HTMLElement | null;
  silverGenerationLevel: HTMLElement | null;
  silverGenerationStat: HTMLElement | null;
  buySilverGeneration: HTMLButtonElement | null;
  goldGenerationCost: HTMLElement | null;
  goldGenerationLevel: HTMLElement | null;
  goldGenerationStat: HTMLElement | null;
  buyGoldGeneration: HTMLButtonElement | null;
  closeMinerPopupButton: HTMLButtonElement | null;
  popupSpeedStat: HTMLElement | null;
  popupRadiusStat: HTMLElement | null;
  popupUpgradeDoubleActivationMin: HTMLButtonElement | null;
  popupDoubleActivationMinCost: HTMLElement | null;
  popupDoubleActivationMinLevel: HTMLElement | null;
  popupDoubleActivationMinStat: HTMLElement | null;
  popupUpgradeDoubleActivationMax: HTMLButtonElement | null;
  popupDoubleActivationMaxCost: HTMLElement | null;
  popupDoubleActivationMaxLevel: HTMLElement | null;
  popupDoubleActivationMaxStat: HTMLElement | null;
  popupUpgradeVeinFinder: HTMLButtonElement | null;
  popupVeinFinderCost: HTMLElement | null;
  popupVeinFinderLevel: HTMLElement | null;
  popupVeinFinderStat: HTMLElement | null;
  popupUpgradeCritChance: HTMLButtonElement | null;
  popupCritChanceCost: HTMLElement | null;
  popupCritChanceLevel: HTMLElement | null;
  popupCritChanceStat: HTMLElement | null;
  popupUpgradeCritMultiplier: HTMLButtonElement | null;
  popupCritMultiplierCost: HTMLElement | null;
  popupCritMultiplierLevel: HTMLElement | null;
  popupCritMultiplierStat: HTMLElement | null;
  popupUpgradeChainReaction: HTMLButtonElement | null;
  popupChainReactionCost: HTMLElement | null;
  popupChainReactionLevel: HTMLElement | null;
  popupChainReactionStat: HTMLElement | null;
  popupSpecStatus: HTMLElement | null;
  popupUnlockClass: HTMLButtonElement | null;
  popupChooseClass: HTMLButtonElement | null;
  popupTargetingRandom: HTMLButtonElement | null;
  popupTargetingHigh: HTMLButtonElement | null;
  popupTargetingLow: HTMLButtonElement | null;
  classModal: HTMLElement | null;
  classPickVeinFinder: HTMLButtonElement | null;
  classPickCrit: HTMLButtonElement | null;
  classPickChainLightning: HTMLButtonElement | null;
  classPickDoubleActivation: HTMLButtonElement | null;
  classModalClose: HTMLButtonElement | null;
  minerStatsPanel: HTMLElement | null;
  minerStatsTitle: HTMLElement | null;
  closeMinerStatsButton: HTMLButtonElement | null;
  statsMinerPosition: HTMLElement | null;
  statsMinerRate: HTMLElement | null;
  statsMinerCooldown: HTMLElement | null;
  statsMinerRadius: HTMLElement | null;
  statsMinerSpeedLevel: HTMLElement | null;
  statsMinerRadiusLevel: HTMLElement | null;
  statsDoubleActivationRange: HTMLElement | null;
}

// State
const state: GameState = {
  coins: 0,
  idleMinerOwned: 0,
  mapExpansions: 0,
  resources: [],
  lastTick: Date.now(),
  lastRenderedMapSize: 0,
  idleMinerCooldowns: [],
  idleMinerPositions: [],
  units: [],
};

const interactionState: InteractionState = {
  activeMinerIndex: null,
  selectedMinerIndex: null,
  repositionMode: false,
  placementMode: false,
  upgradesAccordionOpen: true,
  upgradePanelOpen: false,
  statsPanelOpen: false,
  resourceStatsOpen: false,
  oreCopperRevealed: false,
  oreIronRevealed: false,
  oreSilverRevealed: false,
  oreGoldRevealed: false,
};

const idleMiner: UpgradeConfig = {
  baseCost: 10,
  growth: 1.15,
  triggerIntervalSeconds: 5,
};

const fasterMinerUpgrade: UpgradeConfig = {
  baseCost: 50,
  growth: 1.2,
  bonusClicksPerSecond: 0.1,
};

const minerRadiusUpgrade: UpgradeConfig = {
  baseCost: 60,
  growth: 1.35,
  radiusMultiplierPerLevel: 1.25,
};

state.resources = createDefaultResources();

const doubleActivationMinUpgrade: UpgradeConfig = {
  baseCost: 80,
  growth: 1.2,
};

const doubleActivationMaxUpgrade: UpgradeConfig = {
  baseCost: 100,
  growth: 1.3,
};

const veinFinderUpgrade: UpgradeConfig = {
  baseCost: 320,
  growth: 1.5,
};

const critChanceUpgrade: UpgradeConfig = {
  baseCost: 240,
  growth: 1.3,
};

const critMultiplierUpgrade: UpgradeConfig = {
  baseCost: 360,
  growth: 1.35,
};

const chainReactionUpgrade: UpgradeConfig = {
  baseCost: 280,
  growth: 1.45,
};

// UI Element references
const ui: UIElements = {
  coins: document.getElementById("coins"),
  perSecond: document.getElementById("per-second"),
  idleMinerCost: document.getElementById("idle-miner-cost"),
  idleMinerOwned: document.getElementById("idle-miner-owned"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsModal: document.getElementById("settings-modal"),
  upgradesAccordionBody: document.getElementById("upgrades-accordion-body"),
  toggleUpgradesAccordion: document.getElementById("toggle-upgrades-accordion") as HTMLButtonElement,
  buyIdleMiner: document.getElementById("buy-idle-miner") as HTMLButtonElement,
  save: document.getElementById("save") as HTMLButtonElement,
  reset: document.getElementById("reset") as HTMLButtonElement,
  mapEnvironment: document.getElementById("map-environment"),
  mapSize: document.getElementById("map-size"),
  resourceStatsPanel: document.getElementById("resource-stats-panel"),
  resourceStatsToggle: document.getElementById("resource-stats-toggle") as HTMLButtonElement,
  closeResourceStatsButton: document.getElementById("close-resource-stats") as HTMLButtonElement,
  resourceLegendBody: document.getElementById("resource-legend-body"),
  mapGrid: document.getElementById("map-grid"),
  minerRing: document.getElementById("miner-ring"),
  mapExpandCost: document.getElementById("map-expand-cost"),
  mapExpansions: document.getElementById("map-expansions"),
  expandMap: document.getElementById("expand-map") as HTMLButtonElement,
  status: document.getElementById("status"),
  minerPopup: document.getElementById("miner-popup"),
  minerPopupTitle: document.getElementById("miner-popup-title"),
  popupUpgradeSpeed: document.getElementById("popup-upgrade-speed") as HTMLButtonElement,
  popupUpgradeRadius: document.getElementById("popup-upgrade-radius") as HTMLButtonElement,
  popupSpeedCost: document.getElementById("popup-speed-cost"),
  popupRadiusCost: document.getElementById("popup-radius-cost"),
  popupSpeedLevel: document.getElementById("popup-speed-level"),
  popupRadiusLevel: document.getElementById("popup-radius-level"),
  popupSpeedStat: document.getElementById("popup-speed-stat"),
  popupRadiusStat: document.getElementById("popup-radius-stat"),
  popupReposition: document.getElementById("popup-reposition") as HTMLButtonElement,
  coalGenerationCost: document.getElementById("coal-generation-cost"),
  coalGenerationLevel: document.getElementById("coal-generation-level"),
  coalGenerationStat: document.getElementById("coal-generation-stat"),
  buyCoalGeneration: document.getElementById("buy-coal-generation") as HTMLButtonElement,
  copperGenerationCost: document.getElementById("copper-generation-cost"),
  copperGenerationLevel: document.getElementById("copper-generation-level"),
  copperGenerationStat: document.getElementById("copper-generation-stat"),
  buyCopperGeneration: document.getElementById("buy-copper-generation") as HTMLButtonElement,
  ironGenerationCost: document.getElementById("iron-generation-cost"),
  ironGenerationLevel: document.getElementById("iron-generation-level"),
  ironGenerationStat: document.getElementById("iron-generation-stat"),
  buyIronGeneration: document.getElementById("buy-iron-generation") as HTMLButtonElement,
  silverGenerationCost: document.getElementById("silver-generation-cost"),
  silverGenerationLevel: document.getElementById("silver-generation-level"),
  silverGenerationStat: document.getElementById("silver-generation-stat"),
  buySilverGeneration: document.getElementById("buy-silver-generation") as HTMLButtonElement,
  goldGenerationCost: document.getElementById("gold-generation-cost"),
  goldGenerationLevel: document.getElementById("gold-generation-level"),
  goldGenerationStat: document.getElementById("gold-generation-stat"),
  buyGoldGeneration: document.getElementById("buy-gold-generation") as HTMLButtonElement,
  closeMinerPopupButton: document.getElementById("close-miner-popup") as HTMLButtonElement,
  popupUpgradeDoubleActivationMin: document.getElementById("popup-upgrade-double-activation-min") as HTMLButtonElement,
  popupDoubleActivationMinCost: document.getElementById("popup-double-activation-min-cost"),
  popupDoubleActivationMinLevel: document.getElementById("popup-double-activation-min-level"),
  popupDoubleActivationMinStat: document.getElementById("popup-double-activation-min-stat"),
  popupUpgradeDoubleActivationMax: document.getElementById("popup-upgrade-double-activation-max") as HTMLButtonElement,
  popupDoubleActivationMaxCost: document.getElementById("popup-double-activation-max-cost"),
  popupDoubleActivationMaxLevel: document.getElementById("popup-double-activation-max-level"),
  popupDoubleActivationMaxStat: document.getElementById("popup-double-activation-max-stat"),
  popupUpgradeVeinFinder: document.getElementById("popup-upgrade-vein-finder") as HTMLButtonElement,
  popupVeinFinderCost: document.getElementById("popup-vein-finder-cost"),
  popupVeinFinderLevel: document.getElementById("popup-vein-finder-level"),
  popupVeinFinderStat: document.getElementById("popup-vein-finder-stat"),
  popupUpgradeCritChance: document.getElementById("popup-upgrade-crit-chance") as HTMLButtonElement,
  popupCritChanceCost: document.getElementById("popup-crit-chance-cost"),
  popupCritChanceLevel: document.getElementById("popup-crit-chance-level"),
  popupCritChanceStat: document.getElementById("popup-crit-chance-stat"),
  popupUpgradeCritMultiplier: document.getElementById("popup-upgrade-crit-multiplier") as HTMLButtonElement,
  popupCritMultiplierCost: document.getElementById("popup-crit-multiplier-cost"),
  popupCritMultiplierLevel: document.getElementById("popup-crit-multiplier-level"),
  popupCritMultiplierStat: document.getElementById("popup-crit-multiplier-stat"),
  popupUpgradeChainReaction: document.getElementById("popup-upgrade-chain-reaction") as HTMLButtonElement,
  popupChainReactionCost: document.getElementById("popup-chain-reaction-cost"),
  popupChainReactionLevel: document.getElementById("popup-chain-reaction-level"),
  popupChainReactionStat: document.getElementById("popup-chain-reaction-stat"),
  popupSpecStatus: document.getElementById("popup-spec-status"),
  popupUnlockClass: document.getElementById("popup-unlock-class") as HTMLButtonElement,
  popupChooseClass: document.getElementById("popup-choose-class") as HTMLButtonElement,
  popupTargetingRandom: document.getElementById("popup-targeting-random") as HTMLButtonElement,
  popupTargetingHigh: document.getElementById("popup-targeting-high") as HTMLButtonElement,
  popupTargetingLow: document.getElementById("popup-targeting-low") as HTMLButtonElement,
  classModal: document.getElementById("class-modal"),
  classPickVeinFinder: document.getElementById("class-pick-vein-finder") as HTMLButtonElement,
  classPickCrit: document.getElementById("class-pick-crit") as HTMLButtonElement,
  classPickChainLightning: document.getElementById("class-pick-chain-lightning") as HTMLButtonElement,
  classPickDoubleActivation: document.getElementById("class-pick-double-activation") as HTMLButtonElement,
  classModalClose: document.getElementById("close-class-modal") as HTMLButtonElement,
  minerStatsPanel: document.getElementById("miner-stats-panel"),
  minerStatsTitle: document.getElementById("miner-stats-title"),
  closeMinerStatsButton: document.getElementById("close-miner-stats") as HTMLButtonElement,
  statsMinerPosition: document.getElementById("stats-miner-position"),
  statsMinerRate: document.getElementById("stats-miner-rate"),
  statsMinerCooldown: document.getElementById("stats-miner-cooldown"),
  statsMinerRadius: document.getElementById("stats-miner-radius"),
  statsMinerSpeedLevel: document.getElementById("stats-miner-speed-level"),
  statsMinerRadiusLevel: document.getElementById("stats-miner-radius-level"),
  statsDoubleActivationRange: document.getElementById("stats-double-activation-range"),
};

// Utility functions
function round(value: number, digits: number = 1): number {
  return Number(value.toFixed(digits));
}

function getUpgradeCost(config: UpgradeConfig, owned: number): number {
  return Math.floor(config.baseCost * config.growth ** owned);
}

function getMapSize(): number {
  return 1 + state.mapExpansions;
}

function getMapExpansionCost(): number {
  const nextUpgradeCount = state.mapExpansions + 1;
  return 10 * nextUpgradeCount ** 3;
}

function getIdleMinerCost(): number {
  const nextCount = state.idleMinerOwned + 1;
  return idleMiner.baseCost * nextCount ** 3;
}

function getMinerUpgrade(minerIndex: number): Unit {
  const unit = state.units[minerIndex];
  if (!unit) {
    return {
      speedLevel: 0,
      radiusLevel: 0,
      specializationUnlocked: false,
      specialization: "Worker",
      targeting: "random",
      specializationData: getDefaultSpecializationData("Worker"),
    };
  }

  const specialization = normalizeSpecialization(unit.specialization);
  const specializationDataRaw = (unit.specializationData as Record<string, unknown> | undefined) || {};
  const specializationData = buildSpecializationData(specializationDataRaw, specialization);

  return {
    speedLevel: Number(unit.speedLevel) || 0,
    radiusLevel: Number(unit.radiusLevel) || 0,
    specializationUnlocked: Boolean(unit.specializationUnlocked),
    specialization,
    targeting: (unit.targeting as MinerTargeting) || "random",
    specializationData,
  };
}

function getMinerClicksPerSecond(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  const triggerInterval = idleMiner.triggerIntervalSeconds || 5;
  const bonus = fasterMinerUpgrade.bonusClicksPerSecond || 0.1;
  return 1 / triggerInterval + upgrade.speedLevel * bonus;
}

function getMinerCooldownSeconds(minerIndex: number): number {
  const clicksPerSecond = getMinerClicksPerSecond(minerIndex);
  if (clicksPerSecond <= 0) {
    return Infinity;
  }
  return 1 / clicksPerSecond;
}

function getMinerSpeedUpgradeCost(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  return getUpgradeCost(fasterMinerUpgrade, upgrade.speedLevel);
}

function getMinerRadiusUpgradeCost(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  return getUpgradeCost(minerRadiusUpgrade, upgrade.radiusLevel);
}

function getMinerEffectRadiusPx(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  const multiplier = minerRadiusUpgrade.radiusMultiplierPerLevel || 1.25;
  return BASE_MINER_EFFECT_RADIUS_PX * multiplier ** upgrade.radiusLevel;
}

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
  return { ore, name: ore.charAt(0).toUpperCase() + ore.slice(1), weight: 0, value: 1, baseCost: 0, growth: 1, resourceLevel: 0 };
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

function rollTileType(): OreType {
  const weights: Array<{ ore: OreType; weight: number }> = [
    { ore: "sand", weight: getOreEffectiveWeight("sand") },
    { ore: "coal", weight: getOreEffectiveWeight("coal") },
    { ore: "copper", weight: getOreEffectiveWeight("copper") },
    { ore: "iron", weight: getOreEffectiveWeight("iron") },
    { ore: "silver", weight: getOreEffectiveWeight("silver") },
    { ore: "gold", weight: getOreEffectiveWeight("gold") },
  ];

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

function rollTileTypeWithBoostedOre(boostedOre: UpgradableOre, qualityMultiplier: number): OreType {
  const weights: Array<{ ore: OreType; weight: number }> = [
    { ore: "sand", weight: getOreEffectiveWeight("sand") },
    { ore: "coal", weight: getOreEffectiveWeight("coal") },
    { ore: "copper", weight: getOreEffectiveWeight("copper") },
    { ore: "iron", weight: getOreEffectiveWeight("iron") },
    { ore: "silver", weight: getOreEffectiveWeight("silver") },
    { ore: "gold", weight: getOreEffectiveWeight("gold") },
  ];

  for (const entry of weights) {
    if (entry.ore === boostedOre) {
      entry.weight *= qualityMultiplier;
      break;
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

function getTileCoinValue(tileType: OreType): number {
  return getResourceByOre(tileType).value || 1;
}

function getOreDisplayName(ore: OreType): string {
  return getResourceByOre(ore).name;
}

function renderResourceLegend(): void {
  if (!ui.resourceLegendBody) {
    return;
  }

  const weights = state.resources.map((resource) => ({ ore: resource.ore, weight: getOreEffectiveWeight(resource.ore) }));
  const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0);

  ui.resourceLegendBody.innerHTML = weights
    .map(({ ore, weight }) => {
      const chancePercent = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
      const chanceText = getChanceText(chancePercent);
      return `<p class="resource-legend-row"><span>${getOreDisplayName(ore)}</span><span>${chanceText}%</span><span>${getTileCoinValue(ore)}</span></p>`;
    })
    .join("");
}

function getDoubleActivationMinCost(minerIndex: number): number {
  const unit = getMinerUpgrade(minerIndex);
  const level = unit.specializationData.type === "Multi Activator" ? unit.specializationData.multiActivationMinLevel : 0;
  return getUpgradeCost(doubleActivationMinUpgrade, level);
}

function getDoubleActivationMaxCost(minerIndex: number): number {
  const unit = getMinerUpgrade(minerIndex);
  const level = unit.specializationData.type === "Multi Activator" ? unit.specializationData.multiActivationMaxLevel : 0;
  return getUpgradeCost(doubleActivationMaxUpgrade, level);
}

function getVeinFinderCost(minerIndex: number): number {
  const unit = getMinerUpgrade(minerIndex);
  const level = unit.specializationData.type === "Prospector" ? unit.specializationData.veinFinderLevel : 0;
  return getUpgradeCost(veinFinderUpgrade, level);
}

function getCritChanceCost(minerIndex: number): number {
  const unit = getMinerUpgrade(minerIndex);
  const level = unit.specializationData.type === "Crit Build" ? unit.specializationData.critChanceLevel : 0;
  return getUpgradeCost(critChanceUpgrade, level);
}

function getCritMultiplierCost(minerIndex: number): number {
  const unit = getMinerUpgrade(minerIndex);
  const level = unit.specializationData.type === "Crit Build" ? unit.specializationData.critMultiplierLevel : 0;
  return getUpgradeCost(critMultiplierUpgrade, level);
}

function getChainReactionCost(minerIndex: number): number {
  const unit = getMinerUpgrade(minerIndex);
  const level = unit.specializationData.type === "Chain Lightning" ? unit.specializationData.chainReactionLevel : 0;
  return getUpgradeCost(chainReactionUpgrade, level);
}

function getDoubleActivationMinPercent(minerIndex: number): number {
  if (!canUseClass(minerIndex, "Multi Activator")) {
    return 0;
  }
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Multi Activator" ? data.multiActivationMinLevel : 0;
  return 0.1 + level * 0.1;
}

function getDoubleActivationMaxPercent(minerIndex: number): number {
  if (!canUseClass(minerIndex, "Multi Activator")) {
    return 0;
  }
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Multi Activator" ? data.multiActivationMaxLevel : 0;
  return 0.2 + level * 0.2;
}

function rollDoubleActivation(minerIndex: number): number {
  const minPercent = getDoubleActivationMinPercent(minerIndex);
  const maxPercent = getDoubleActivationMaxPercent(minerIndex);

  // If min > max, just use max
  if (minPercent > maxPercent) {
    return maxPercent;
  }

  // Roll between min and max
  return minPercent + Math.random() * (maxPercent - minPercent);
}

function getActivationCountFromRoll(roll: number): number {
  // roll is in decimal form (0.4 = 40%, 2.3 = 230%)
  // For every 1.0 (100%), activate one tile
  // For the remainder, there's a percentage chance for another
  const fullActivations = Math.floor(roll);
  const remainder = roll - fullActivations;
  const extraChance = Math.random() < remainder ? 1 : 0;
  return fullActivations + extraChance;
}

// Stat display functions for showing current vs next level
function getOreGenerationStatText(ore: UpgradableOre): string {
  const currentLevel = getOreGenerationLevel(ore);
  const currentWeight = getOreWeightForLevel(ore, currentLevel);
  const nextWeight = getOreWeightForLevel(ore, currentLevel + 1);
  if (currentLevel <= 0) {
    return `Locked. Weight: 0 → ${round(nextWeight, 2).toLocaleString()} on first upgrade`;
  }
  return `Weight: ${round(currentWeight, 2).toLocaleString()} → ${round(nextWeight, 2).toLocaleString()} (+20%)`;
}

function getMinerSpeedStatText(minerIndex: number): string {
  const upgrade = getMinerUpgrade(minerIndex);
  const base = 1 / (idleMiner.triggerIntervalSeconds || 5);
  const bonus = fasterMinerUpgrade.bonusClicksPerSecond || 0.1;
  const current = (base + upgrade.speedLevel * bonus).toFixed(2);
  const next = (base + (upgrade.speedLevel + 1) * bonus).toFixed(2);
  return `Current: ${current} act/sec → Upgrading to: ${next} act/sec`;
}

function getMinerRadiusStatText(minerIndex: number): string {
  const upgrade = getMinerUpgrade(minerIndex);
  const nextRadius = upgrade.radiusLevel + 1;
  const multiplier = minerRadiusUpgrade.radiusMultiplierPerLevel || 1.25;
  const currentMultiplier = (multiplier ** upgrade.radiusLevel).toFixed(2);
  const nextMultiplier = (multiplier ** nextRadius).toFixed(2);
  return `Current: ${currentMultiplier}x radius → Upgrading to: ${nextMultiplier}x radius`;
}

function getDoubleActivationMinStatText(minerIndex: number): string {
  const current = (getDoubleActivationMinPercent(minerIndex) * 100).toFixed(0);
  const next = ((getDoubleActivationMinPercent(minerIndex) + 0.1) * 100).toFixed(0);
  return `Current min: ${current}% → Upgrading to: ${next}%`;
}

function getDoubleActivationMaxStatText(minerIndex: number): string {
  const current = (getDoubleActivationMaxPercent(minerIndex) * 100).toFixed(0);
  const next = ((getDoubleActivationMaxPercent(minerIndex) + 0.2) * 100).toFixed(0);
  return `Current max: ${current}% → Upgrading to: ${next}%`;
}

function getVeinFinderQualityMultiplier(minerIndex: number): number {
  if (!canUseClass(minerIndex, "Prospector")) {
    return 1;
  }
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Prospector" ? data.veinFinderLevel : 0;
  return 1.25 + level * 0.25;
}

function getVeinFinderStatText(minerIndex: number): string {
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Prospector" ? data.veinFinderLevel : 0;
  const currentBoost = (getVeinFinderQualityMultiplier(minerIndex) - 1) * 100;
  const nextBoost = (1 + (level + 1) * 0.25 - 1) * 100;
  return `Current boost: +${currentBoost.toFixed(0)}% → Upgrading to: +${nextBoost.toFixed(0)}% for mined ore respawn weight`;
}

function getCritChance(minerIndex: number): number {
  if (!canUseClass(minerIndex, "Crit Build")) {
    return 0;
  }
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Crit Build" ? data.critChanceLevel : 0;
  return Math.min(0.6, 0.1 + level * 0.03);
}

function getCritMultiplier(minerIndex: number): number {
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Crit Build" ? data.critMultiplierLevel : 0;
  return 2 + level * 0.2;
}

function getChainReactionChance(minerIndex: number): number {
  if (!canUseClass(minerIndex, "Chain Lightning")) {
    return 0;
  }
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Chain Lightning" ? data.chainReactionChanceLevel : 0;
  return Math.min(0.5, 0.1 + level * 0.02);
}

function getChainReactionLength(minerIndex: number): number {
  if (!canUseClass(minerIndex, "Chain Lightning")) {
    return 0;
  }
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Chain Lightning" ? data.chainReactionLevel : 0;
  return 1 + level;
}

function getCritChanceStatText(minerIndex: number): string {
  const current = (getCritChance(minerIndex) * 100).toFixed(0);
  const data = getMinerUpgrade(minerIndex).specializationData;
  const level = data.type === "Crit Build" ? data.critChanceLevel : 0;
  const next = (Math.min(0.5, (level + 1) * 0.03) * 100).toFixed(0);
  return `Current chance: ${current}% → Upgrading to: ${next}%`;
}

function getCritMultiplierStatText(minerIndex: number): string {
  const current = getCritMultiplier(minerIndex).toFixed(1);
  const next = (getCritMultiplier(minerIndex) + 0.2).toFixed(1);
  return `Current crit: ${current}x → Upgrading to: ${next}x`;
}

function getChainReactionStatText(minerIndex: number): string {
  const currentChance = (getChainReactionChance(minerIndex) * 100).toFixed(0);
  const currentLength = getChainReactionLength(minerIndex);
  const nextLength = currentLength + 1;
  return `Current: ${currentChance}% chance, ${currentLength} adjacent chain(s) → Upgrading to: ${nextLength}`;
}

function getMinerDisplayName(minerIndex: number): string {
  const spec = getMinerUpgrade(minerIndex).specialization;
  const number = minerIndex + 1;
  return `${getSpecializationLabel(spec)} ${number}`;
}

function getMinerRingLabel(minerIndex: number): string {
  const upgrade = getMinerUpgrade(minerIndex);
  if (upgrade.specialization === "Prospector") {
    return `🧭${minerIndex + 1}`;
  }
  if (upgrade.specialization === "Crit Build") {
    return `🎯${minerIndex + 1}`;
  }
  if (upgrade.specialization === "Chain Lightning") {
    return `⚡${minerIndex + 1}`;
  }
  if (upgrade.specialization === "Multi Activator") {
    return `⏩${minerIndex + 1}`;
  }
  return `W${minerIndex + 1}`;
}

function canOfferClassUnlock(minerIndex: number): boolean {
  const upgrade = getMinerUpgrade(minerIndex);
  return !upgrade.specializationUnlocked && upgrade.specialization === "Worker" && getMinerClicksPerSecond(minerIndex) >= 1;
}

function canChooseSpecialization(minerIndex: number): boolean {
  const upgrade = getMinerUpgrade(minerIndex);
  return upgrade.specializationUnlocked && upgrade.specialization === "Worker";
}

function canUseClass(minerIndex: number, spec: UnitSpecialization): boolean {
  const selected = getMinerUpgrade(minerIndex).specialization;
  return selected === spec;
}

function selectMinerSpecialization(spec: Exclude<UnitSpecialization, "Worker">): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null || !canChooseSpecialization(minerIndex)) {
    return;
  }
  state.units[minerIndex].specialization = spec;
  state.units[minerIndex].specializationData = getDefaultSpecializationData(spec);
  setClassModalOpen(false);
  render();
}

function unlockClassChoice(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null || !canOfferClassUnlock(minerIndex)) {
    return;
  }
  if (!canAfford(SPECIALIZATION_COST)) {
    return;
  }
  state.coins -= SPECIALIZATION_COST;
  state.units[minerIndex].specializationUnlocked = true;
  render();
}

function setClassModalOpen(isOpen: boolean): void {
  if (!ui.classModal) return;
  ui.classModal.classList.toggle("hidden", !isOpen);
}

function setMinerTargeting(mode: MinerTargeting): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }
  state.units[minerIndex].targeting = mode;
  renderMinerPopup();
}

function chooseTargetTile(minerIndex: number, eligibleTiles: HTMLElement[]): HTMLElement {
  const targeting = getMinerUpgrade(minerIndex).targeting;
  if (targeting === "random") {
    return eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
  }

  let targetValue = targeting === "high-quality" ? -Infinity : Infinity;
  const bestTiles: HTMLElement[] = [];

  for (const tile of eligibleTiles) {
    const tileType = (tile.dataset.tileType as OreType) || "sand";
    const value = getTileCoinValue(tileType);
    const isBetter = targeting === "high-quality" ? value > targetValue : value < targetValue;
    if (isBetter) {
      targetValue = value;
      bestTiles.length = 0;
      bestTiles.push(tile);
    } else if (value === targetValue) {
      bestTiles.push(tile);
    }
  }

  return bestTiles[Math.floor(Math.random() * bestTiles.length)] || eligibleTiles[0];
}

function getCoinsPerSecond(): number {
  let total = 0;
  for (let minerIndex = 0; minerIndex < state.idleMinerOwned; minerIndex += 1) {
    total += getMinerClicksPerSecond(minerIndex);
  }
  return total;
}

function format(value: number): string {
  return round(value, 1).toLocaleString();
}

function setStatus(message: string): void {
  if (!ui.status) return;
  ui.status.textContent = message;
  if (!message) {
    return;
  }
  setTimeout(() => {
    if (ui.status && ui.status.textContent === message) {
      ui.status.textContent = "";
    }
  }, 1600);
}

function canAfford(cost: number): boolean {
  return state.coins >= cost;
}

function saveGame(showStatus: boolean = true): void {
  saveGameState(SAVE_KEY, state);

  if (showStatus) {
    setStatus("Saved.");
  }
}

function syncIdleMinerState(): void {
  while (state.idleMinerCooldowns.length < state.idleMinerOwned) {
    const minerIndex = state.idleMinerCooldowns.length;
    state.idleMinerCooldowns.push(getMinerCooldownSeconds(minerIndex));
  }
  if (state.idleMinerCooldowns.length > state.idleMinerOwned) {
    state.idleMinerCooldowns.length = state.idleMinerOwned;
  }

  while (state.idleMinerPositions.length < state.idleMinerOwned) {
    state.idleMinerPositions.push(null);
  }
  if (state.idleMinerPositions.length > state.idleMinerOwned) {
    state.idleMinerPositions.length = state.idleMinerOwned;
  }

  while (state.units.length < state.idleMinerOwned) {
    state.units.push({
      speedLevel: 0,
      radiusLevel: 0,
      specializationUnlocked: false,
      specialization: "Worker",
      targeting: "random",
      specializationData: getDefaultSpecializationData("Worker"),
    });
  }
  if (state.units.length > state.idleMinerOwned) {
    state.units.length = state.idleMinerOwned;
  }

  if (interactionState.selectedMinerIndex !== null && interactionState.selectedMinerIndex >= state.idleMinerOwned) {
    closeMinerPanels();
  }
}

function loadGame(): void {
  const outcome = loadGameState(SAVE_KEY, state, syncIdleMinerState, getCoinsPerSecond, round);
  if (outcome.invalid) {
    setStatus("Save data was invalid and has been ignored.");
    return;
  }
  if (outcome.hasSave) {
    setStatus(`Welcome back! Earned ${outcome.awayCoins.toLocaleString()} while away.`);
  }
}

function getMinerPosition(minerIndex: number): Position {
  const position = state.idleMinerPositions[minerIndex];
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    return position;
  }
  return getDefaultMinerPosition(minerIndex, state.idleMinerOwned, getMapSize());
}

function getEligibleTilesForMiner(minerIndex: number, availableTiles: HTMLElement[], mapSize: number): HTMLElement[] {
  const minerPosition = getMinerPosition(minerIndex);
  const minerRadius = getMinerEffectRadiusPx(minerIndex);

  return availableTiles.filter((tile) => {
    const tileIndex = Number(tile.dataset.tileIndex);
    if (!Number.isInteger(tileIndex) || tileIndex < 0) {
      return false;
    }

    const bounds = getTileBoundsByIndex(tileIndex, mapSize);
    const coverage = getTileCoverageInMinerRadius(minerPosition, bounds, minerRadius);
    return coverage >= MIN_TILE_COVERAGE_IN_RADIUS;
  });
}

function getAdjacentTileIndices(tileIndex: number, mapSize: number): number[] {
  const column = tileIndex % mapSize;
  const row = Math.floor(tileIndex / mapSize);
  const indices: number[] = [];

  if (row > 0) indices.push(tileIndex - mapSize);
  if (row < mapSize - 1) indices.push(tileIndex + mapSize);
  if (column > 0) indices.push(tileIndex - 1);
  if (column < mapSize - 1) indices.push(tileIndex + 1);

  return indices;
}

function triggerChainReaction(minerIndex: number, sourceTile: HTMLElement, mapSize: number): number {
  if (!ui.mapGrid || Math.random() >= getChainReactionChance(minerIndex)) {
    return 0;
  }

  let triggered = 0;
  let currentTile = sourceTile;
  let remainingSteps = getChainReactionLength(minerIndex);
  const usedIndices = new Set<number>();
  const sourceIndex = Number(sourceTile.dataset.tileIndex);
  if (Number.isInteger(sourceIndex)) {
    usedIndices.add(sourceIndex);
  }

  while (remainingSteps > 0) {
    const currentIndex = Number(currentTile.dataset.tileIndex);
    if (!Number.isInteger(currentIndex)) {
      break;
    }

    const adjacentTiles = getAdjacentTileIndices(currentIndex, mapSize)
      .map((index) => ui.mapGrid?.querySelector(`.map-tile[data-tile-index="${index}"]`) as HTMLElement | null)
      .filter(
        (tile): tile is HTMLElement =>
          tile instanceof HTMLElement &&
          !tile.classList.contains("map-tile--cooldown") &&
          !usedIndices.has(Number(tile.dataset.tileIndex))
      );

    if (adjacentTiles.length === 0) {
      break;
    }

    const nextTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
    const nextIndex = Number(nextTile.dataset.tileIndex);
    if (Number.isInteger(nextIndex)) {
      usedIndices.add(nextIndex);
    }

    if (!activateTile(nextTile, false, minerIndex)) {
      break;
    }

    triggered += 1;
    currentTile = nextTile;
    remainingSteps -= 1;
  }

  return triggered;
}

function setSettingsModalOpen(isOpen: boolean): void {
  if (!ui.settingsModal || !ui.settingsToggle) return;
  ui.settingsModal.classList.toggle("hidden", !isOpen);
  ui.settingsModal.setAttribute("aria-hidden", String(!isOpen));
  ui.settingsToggle.setAttribute("aria-expanded", String(isOpen));
}

function openMinerPanels(minerIndex: number): void {
  interactionState.selectedMinerIndex = minerIndex;
  interactionState.repositionMode = false;
  interactionState.resourceStatsOpen = false;
  interactionState.upgradePanelOpen = true;
  interactionState.statsPanelOpen = true;
  renderResourceStatsPanel();
  renderMinerStatsPanel();
  renderMinerPopup();
}

function renderResourceStatsPanel(): void {
  renderResourceStatsPanelView({
    resourceStatsPanel: ui.resourceStatsPanel,
    resourceStatsToggle: ui.resourceStatsToggle,
    isOpen: interactionState.resourceStatsOpen,
  });
}

function toggleResourceStatsPanel(): void {
  const willOpen = !interactionState.resourceStatsOpen;
  if (willOpen) {
    closeMinerStatsPanel();
  }
  interactionState.resourceStatsOpen = willOpen;
  renderResourceStatsPanel();
}

function closeResourceStatsPanel(): void {
  interactionState.resourceStatsOpen = false;
  renderResourceStatsPanel();
}

function renderUpgradesAccordion(): void {
  renderUpgradesAccordionView({
    upgradesAccordionBody: ui.upgradesAccordionBody,
    toggleUpgradesAccordion: ui.toggleUpgradesAccordion,
    isOpen: interactionState.upgradesAccordionOpen,
  });
}

function toggleUpgradesAccordion(): void {
  interactionState.upgradesAccordionOpen = !interactionState.upgradesAccordionOpen;
  renderUpgradesAccordion();
}

function closeMinerUpgradePanel(): void {
  interactionState.upgradePanelOpen = false;
  interactionState.repositionMode = false;
  interactionState.placementMode = false;
  interactionState.activeMinerIndex = null;
  if (!interactionState.statsPanelOpen) {
    interactionState.selectedMinerIndex = null;
  }
  if (ui.minerPopup) {
    ui.minerPopup.classList.add("hidden");
  }
}

function closeMinerStatsPanel(): void {
  interactionState.statsPanelOpen = false;
  if (!interactionState.upgradePanelOpen) {
    interactionState.selectedMinerIndex = null;
  }
  if (ui.minerStatsPanel) {
    ui.minerStatsPanel.classList.add("hidden");
  }
}

function closeMinerPanels(): void {
  interactionState.upgradePanelOpen = false;
  interactionState.statsPanelOpen = false;
  interactionState.selectedMinerIndex = null;
  interactionState.repositionMode = false;
  interactionState.placementMode = false;
  interactionState.activeMinerIndex = null;
  if (ui.minerPopup) {
    ui.minerPopup.classList.add("hidden");
  }
  if (ui.minerStatsPanel) {
    ui.minerStatsPanel.classList.add("hidden");
  }
}

function clearTileOreClasses(tile: HTMLElement): void {
  tile.classList.remove("map-tile--coal", "map-tile--copper", "map-tile--iron", "map-tile--silver", "map-tile--gold");
}

function getTileAriaLabel(tileType: OreType): string {
  switch (tileType) {
    case "coal":
      return "Coal tile";
    case "copper":
      return "Copper tile";
    case "iron":
      return "Iron tile";
    case "silver":
      return "Silver tile";
    case "gold":
      return "Gold tile";
    default:
      return "Sandy tile";
  }
}

function applyTileType(tile: HTMLElement, tileType: OreType): void {
  tile.dataset.tileType = tileType;
  clearTileOreClasses(tile);
  if (tileType !== "sand") {
    tile.classList.add(`map-tile--${tileType}`);
  }
  tile.setAttribute("aria-label", getTileAriaLabel(tileType));
}

function activateTile(tile: HTMLElement, shouldRender: boolean = true, minerIndex: number | null = null): boolean {
  if (!(tile instanceof HTMLElement) || tile.classList.contains("map-tile--cooldown")) {
    return false;
  }

  const tileType = (tile.dataset.tileType as OreType) || "sand";
  let payout = getTileCoinValue(tileType);
  if (minerIndex !== null && Math.random() < getCritChance(minerIndex)) {
    payout *= getCritMultiplier(minerIndex);
  }
  state.coins += payout;
  
  tile.classList.add("map-tile--cooldown");
  tile.dataset.tileType = "sand";
  clearTileOreClasses(tile);

  const minedOre = tileType === "sand" ? null : (tileType as UpgradableOre);
  const qualityMultiplier = minerIndex === null ? 1 : getVeinFinderQualityMultiplier(minerIndex);
  
  setTimeout(() => {
    tile.classList.remove("map-tile--cooldown");
    if (minedOre && qualityMultiplier > 1) {
      applyTileType(tile, rollTileTypeWithBoostedOre(minedOre, qualityMultiplier));
    } else {
      applyTileType(tile, rollTileType());
    }
  }, 1000);

  if (shouldRender) {
    render();
  }
  return true;
}

function buyIdleMiner(): void {
  const cost = getIdleMinerCost();
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerOwned += 1;
  syncIdleMinerState();
  render();
}

function buyMinerSpeedUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }

  const cost = getMinerSpeedUpgradeCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }

  const previousCooldown = getMinerCooldownSeconds(minerIndex);
  state.coins -= cost;
  state.units[minerIndex].speedLevel += 1;
  const updatedCooldown = getMinerCooldownSeconds(minerIndex);

  if (Number.isFinite(previousCooldown) && previousCooldown > 0) {
    const scale = updatedCooldown / previousCooldown;
    state.idleMinerCooldowns[minerIndex] = Math.max(0, state.idleMinerCooldowns[minerIndex] * scale);
  }

  render();
}

function buyMinerRadiusUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }

  const cost = getMinerRadiusUpgradeCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }

  state.coins -= cost;
  state.units[minerIndex].radiusLevel += 1;
  render();
}

function toggleMinerRepositionMode(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }

  interactionState.placementMode = !interactionState.placementMode;
  renderMinerPopup();
  renderMinerRing();
}

function resetGame(): void {
  clearSavedGame(SAVE_KEY);
  state.coins = 0;
  state.idleMinerOwned = 0;
  state.mapExpansions = 0;
  state.resources = createDefaultResources();
  state.lastTick = Date.now();
  state.lastRenderedMapSize = 0;
  state.idleMinerCooldowns = [];
  state.idleMinerPositions = [];
  state.units = [];
  closeMinerPanels();
  render();
  setSettingsModalOpen(false);
  setStatus("Progress reset.");
}

function buyMapExpansion(): void {
  const cost = getMapExpansionCost();
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.mapExpansions += 1;
  render();
}

function buyOreGeneration(ore: UpgradableOre): void {
  const cost = getOreGenerationCost(ore);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  setOreGenerationLevel(ore, getOreGenerationLevel(ore) + 1);
  render();
}

function buyCoalGeneration(): void {
  buyOreGeneration("coal");
}

function buyCopperGeneration(): void {
  buyOreGeneration("copper");
}

function buyIronGeneration(): void {
  buyOreGeneration("iron");
}

function buySilverGeneration(): void {
  buyOreGeneration("silver");
}

function buyGoldGeneration(): void {
  buyOreGeneration("gold");
}

function buyDoubleActivationMin(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "Multi Activator")) return;
  const cost = getDoubleActivationMinCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  const data = state.units[minerIndex].specializationData;
  if (data.type === "Multi Activator") {
    data.multiActivationMinLevel += 1;
  }
  render();
}

function buyDoubleActivationMax(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "Multi Activator")) return;
  const cost = getDoubleActivationMaxCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  const data = state.units[minerIndex].specializationData;
  if (data.type === "Multi Activator") {
    data.multiActivationMaxLevel += 1;
  }
  render();
}

function buyVeinFinderUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "Prospector")) return;
  const cost = getVeinFinderCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  const data = state.units[minerIndex].specializationData;
  if (data.type === "Prospector") {
    data.veinFinderLevel += 1;
  }
  render();
}

function buyCritChanceUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "Crit Build")) return;
  const cost = getCritChanceCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  const data = state.units[minerIndex].specializationData;
  if (data.type === "Crit Build") {
    data.critChanceLevel += 1;
  }
  render();
}

function buyCritMultiplierUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "Crit Build")) return;
  const cost = getCritMultiplierCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  const data = state.units[minerIndex].specializationData;
  if (data.type === "Crit Build") {
    data.critMultiplierLevel += 1;
  }
  render();
}

function buyChainReactionUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "Chain Lightning")) return;
  const cost = getChainReactionCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  const data = state.units[minerIndex].specializationData;
  if (data.type === "Chain Lightning") {
    data.chainReactionLevel += 1;
  }
  render();
}

function renderMap(): void {
  if (!ui.mapGrid) return;
  const mapSize = getMapSize();
  if (state.lastRenderedMapSize === mapSize) {
    return;
  }

  const tileCount = mapSize * mapSize;
  ui.mapGrid.style.gridTemplateColumns = `repeat(${mapSize}, 38px)`;
  ui.mapGrid.innerHTML = "";

  for (let index = 0; index < tileCount; index += 1) {
    const tile = document.createElement("div");
    tile.className = "map-tile";
    tile.dataset.tileIndex = index.toString();

    applyTileType(tile, rollTileType());
    ui.mapGrid.appendChild(tile);
  }

  state.lastRenderedMapSize = mapSize;
}

function renderMinerRing(): void {
  if (!ui.minerRing) return;
  ui.minerRing.innerHTML = "";
  if (state.idleMinerOwned <= 0) {
    return;
  }

  for (let index = 0; index < state.idleMinerOwned; index += 1) {
    const cooldownLeft = Math.max(0, state.idleMinerCooldowns[index] ?? 0);
    const { x, y } = getMinerPosition(index);

    const minerNode = document.createElement("div");
    minerNode.className = "miner-node";
    if (interactionState.activeMinerIndex === index) {
      minerNode.classList.add("dragging");
    }
    minerNode.dataset.minerIndex = index.toString();
    minerNode.style.setProperty("--miner-radius", `${getMinerEffectRadiusPx(index)}px`);
    minerNode.style.left = `calc(50% + ${x}px)`;
    minerNode.style.top = `calc(50% + ${y}px)`;
    minerNode.innerHTML = `<strong>${getMinerRingLabel(index)}</strong>${cooldownLeft.toFixed(1)}s`;
    ui.minerRing.appendChild(minerNode);
  }
}

function moveMinerToPointer(clientX: number, clientY: number): void {
  if (!interactionState.placementMode || interactionState.selectedMinerIndex === null || !ui.mapEnvironment) {
    return;
  }
  const minerIndex = interactionState.selectedMinerIndex;

  const bounds = ui.mapEnvironment.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const maxX = Math.max(20, bounds.width / 2 - 20);
  const maxY = Math.max(20, bounds.height / 2 - 20);

  const x = clamp(clientX - centerX, -maxX, maxX);
  const y = clamp(clientY - centerY, -maxY, maxY);

  state.idleMinerPositions[minerIndex] = { x, y };
  renderMinerRing();
}

function renderMinerPopup(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
    renderMinerPopupView(ui, {
      isVisible: false,
      title: "",
      speedLevel: 0,
      radiusLevel: 0,
      doubleActivationMinLevel: 0,
      doubleActivationMaxLevel: 0,
      veinFinderLevel: 0,
      critChanceLevel: 0,
      critMultiplierLevel: 0,
      chainReactionLevel: 0,
      speedCost: 0,
      radiusCost: 0,
      doubleActivationMinCost: 0,
      doubleActivationMaxCost: 0,
      veinFinderCost: 0,
      critChanceCost: 0,
      critMultiplierCost: 0,
      chainReactionCost: 0,
      speedStat: "",
      radiusStat: "",
      doubleActivationMinStat: "",
      doubleActivationMaxStat: "",
      veinFinderStat: "",
      critChanceStat: "",
      critMultiplierStat: "",
      chainReactionStat: "",
      specStatus: "",
      canUnlockClass: false,
      specAffordable: false,
      canChooseClass: false,
      targeting: "random",
      showDoubleActivation: false,
      showVeinFinder: false,
      showCrit: false,
      showChainLightning: false,
      canBuySpeed: false,
      canBuyRadius: false,
      canBuyDoubleActivationMin: false,
      canBuyDoubleActivationMax: false,
      canBuyVeinFinder: false,
      canBuyCritChance: false,
      canBuyCritMultiplier: false,
      canBuyChainReaction: false,
      placementMode: interactionState.placementMode,
    });
    return;
  }

  const upgrade = getMinerUpgrade(minerIndex);
  const speedCost = getMinerSpeedUpgradeCost(minerIndex);
  const radiusCost = getMinerRadiusUpgradeCost(minerIndex);
  const doubleActivationMinCost = getDoubleActivationMinCost(minerIndex);
  const doubleActivationMaxCost = getDoubleActivationMaxCost(minerIndex);
  const veinFinderCost = getVeinFinderCost(minerIndex);
  const critChanceCost = getCritChanceCost(minerIndex);
  const critMultiplierCost = getCritMultiplierCost(minerIndex);
  const chainReactionCost = getChainReactionCost(minerIndex);
  const canUnlockClass = canOfferClassUnlock(minerIndex);
  const canSpec = canChooseSpecialization(minerIndex);
  const selectedSpec = upgrade.specialization;
  const specAffordable = canAfford(SPECIALIZATION_COST);
  const showDoubleActivation = selectedSpec === "Multi Activator";
  const showVeinFinder = selectedSpec === "Prospector";
  const showCrit = selectedSpec === "Crit Build";
  const showChainLightning = selectedSpec === "Chain Lightning";
  const multiData = upgrade.specializationData.type === "Multi Activator" ? upgrade.specializationData : null;
  const prospectorData = upgrade.specializationData.type === "Prospector" ? upgrade.specializationData : null;
  const critData = upgrade.specializationData.type === "Crit Build" ? upgrade.specializationData : null;
  const chainData = upgrade.specializationData.type === "Chain Lightning" ? upgrade.specializationData : null;

  const specStatus = selectedSpec !== "Worker"
    ? `Specialization: ${getSpecializationLabel(selectedSpec)}`
    : canSpec
    ? "Class unlocked. Choose specialization"
    : canUnlockClass
    ? `Unlock class for ${SPECIALIZATION_COST} coins`
    : "Unlocks at 1.00 act/sec";

  renderMinerPopupView(ui, {
    isVisible: interactionState.upgradePanelOpen,
    title: getMinerDisplayName(minerIndex),
    speedLevel: upgrade.speedLevel,
    radiusLevel: upgrade.radiusLevel,
    doubleActivationMinLevel: multiData?.multiActivationMinLevel ?? 0,
    doubleActivationMaxLevel: multiData?.multiActivationMaxLevel ?? 0,
    veinFinderLevel: prospectorData?.veinFinderLevel ?? 0,
    critChanceLevel: critData?.critChanceLevel ?? 0,
    critMultiplierLevel: critData?.critMultiplierLevel ?? 0,
    chainReactionLevel: chainData?.chainReactionLevel ?? 0,
    speedCost,
    radiusCost,
    doubleActivationMinCost,
    doubleActivationMaxCost,
    veinFinderCost,
    critChanceCost,
    critMultiplierCost,
    chainReactionCost,
    speedStat: getMinerSpeedStatText(minerIndex),
    radiusStat: getMinerRadiusStatText(minerIndex),
    doubleActivationMinStat: getDoubleActivationMinStatText(minerIndex),
    doubleActivationMaxStat: getDoubleActivationMaxStatText(minerIndex),
    veinFinderStat: getVeinFinderStatText(minerIndex),
    critChanceStat: getCritChanceStatText(minerIndex),
    critMultiplierStat: getCritMultiplierStatText(minerIndex),
    chainReactionStat: getChainReactionStatText(minerIndex),
    specStatus,
    canUnlockClass,
    specAffordable,
    canChooseClass: canSpec,
    targeting: upgrade.targeting,
    showDoubleActivation,
    showVeinFinder,
    showCrit,
    showChainLightning,
    canBuySpeed: canAfford(speedCost),
    canBuyRadius: canAfford(radiusCost),
    canBuyDoubleActivationMin: canAfford(doubleActivationMinCost) && canUseClass(minerIndex, "Multi Activator"),
    canBuyDoubleActivationMax: canAfford(doubleActivationMaxCost) && canUseClass(minerIndex, "Multi Activator"),
    canBuyVeinFinder: canAfford(veinFinderCost) && canUseClass(minerIndex, "Prospector"),
    canBuyCritChance: canAfford(critChanceCost) && canUseClass(minerIndex, "Crit Build"),
    canBuyCritMultiplier: canAfford(critMultiplierCost) && canUseClass(minerIndex, "Crit Build"),
    canBuyChainReaction: canAfford(chainReactionCost) && canUseClass(minerIndex, "Chain Lightning"),
    placementMode: interactionState.placementMode,
  });
}

function renderMinerStatsPanel(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
    renderMinerStatsPanelView(ui, {
      isVisible: false,
      title: "",
      positionText: "",
      rateText: "",
      cooldownText: "",
      radiusText: "",
      speedLevel: 0,
      radiusLevel: 0,
      doubleActivationRangeText: "",
    });
    return;
  }

  const upgrade = getMinerUpgrade(minerIndex);
  const position = getMinerPosition(minerIndex);
  const clicksPerSecond = getMinerClicksPerSecond(minerIndex);
  const cooldownSeconds = getMinerCooldownSeconds(minerIndex);
  const radiusPx = getMinerEffectRadiusPx(minerIndex);
  const minPercent = Math.round(getDoubleActivationMinPercent(minerIndex) * 100);
  const maxPercent = Math.round(getDoubleActivationMaxPercent(minerIndex) * 100);

  renderMinerStatsPanelView(ui, {
    isVisible: interactionState.statsPanelOpen,
    title: `${getMinerDisplayName(minerIndex)} Stats`,
    positionText: `${Math.round(position.x)}, ${Math.round(position.y)}`,
    rateText: `${clicksPerSecond.toFixed(2)} act/sec`,
    cooldownText: `${cooldownSeconds.toFixed(2)}s`,
    radiusText: `${Math.round(radiusPx)}px`,
    speedLevel: upgrade.speedLevel,
    radiusLevel: upgrade.radiusLevel,
    doubleActivationRangeText: `${minPercent}%-${maxPercent}%`,
  });
}

function runIdleMiners(deltaSeconds: number): void {
  runIdleMinersLoop(deltaSeconds, {
    state,
    mapGrid: ui.mapGrid,
    syncIdleMinerState,
    getMapSize,
    getMinerCooldownSeconds,
    getEligibleTilesForMiner,
    chooseTargetTile,
    activateTile,
    triggerChainReaction,
    rollDoubleActivation,
    getActivationCountFromRoll,
    render,
  });
}

function render(): void {
  syncIdleMinerState();

  const cps = getCoinsPerSecond();
  const idleMinerCost = getIdleMinerCost();
  const mapCost = getMapExpansionCost();
  const coalCost = getOreGenerationCost("coal");
  const copperCost = getOreGenerationCost("copper");
  const ironCost = getOreGenerationCost("iron");
  const silverCost = getOreGenerationCost("silver");
  const goldCost = getOreGenerationCost("gold");
  const mapSize = getMapSize();

  if (!interactionState.oreCopperRevealed && shouldRevealNextOre(getOreGenerationLevel("coal"), state.coins, copperCost)) {
    interactionState.oreCopperRevealed = true;
  }
  if (!interactionState.oreIronRevealed && shouldRevealNextOre(getOreGenerationLevel("copper"), state.coins, ironCost)) {
    interactionState.oreIronRevealed = true;
  }
  if (!interactionState.oreSilverRevealed && shouldRevealNextOre(getOreGenerationLevel("iron"), state.coins, silverCost)) {
    interactionState.oreSilverRevealed = true;
  }
  if (!interactionState.oreGoldRevealed && shouldRevealNextOre(getOreGenerationLevel("silver"), state.coins, goldCost)) {
    interactionState.oreGoldRevealed = true;
  }

  if (ui.coins) ui.coins.textContent = format(state.coins);
  if (ui.perSecond) ui.perSecond.textContent = format(cps);
  if (ui.idleMinerCost) ui.idleMinerCost.textContent = idleMinerCost.toLocaleString();
  if (ui.idleMinerOwned) ui.idleMinerOwned.textContent = state.idleMinerOwned.toString();
  if (ui.buyIdleMiner) ui.buyIdleMiner.disabled = !canAfford(idleMinerCost);
  if (ui.mapExpandCost) ui.mapExpandCost.textContent = mapCost.toLocaleString();
  if (ui.mapExpansions) ui.mapExpansions.textContent = state.mapExpansions.toString();
  if (ui.mapSize) ui.mapSize.textContent = `${mapSize}x${mapSize}`;
  if (ui.expandMap) ui.expandMap.disabled = !canAfford(mapCost);
  if (ui.coalGenerationCost) ui.coalGenerationCost.textContent = coalCost.toLocaleString();
  if (ui.coalGenerationLevel) ui.coalGenerationLevel.textContent = getOreGenerationLevel("coal").toString();
  if (ui.coalGenerationStat) ui.coalGenerationStat.textContent = getOreGenerationStatText("coal");
  if (ui.buyCoalGeneration) ui.buyCoalGeneration.disabled = !canAfford(coalCost);
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.classList.toggle("hidden", !interactionState.oreCopperRevealed && getOreGenerationLevel("copper") === 0);
  if (ui.copperGenerationCost) ui.copperGenerationCost.textContent = copperCost.toLocaleString();
  if (ui.copperGenerationLevel) ui.copperGenerationLevel.textContent = getOreGenerationLevel("copper").toString();
  if (ui.copperGenerationStat) ui.copperGenerationStat.textContent = getOreGenerationStatText("copper");
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.disabled = !canAfford(copperCost);
  if (ui.buyIronGeneration) ui.buyIronGeneration.classList.toggle("hidden", !interactionState.oreIronRevealed && getOreGenerationLevel("iron") === 0);
  if (ui.ironGenerationCost) ui.ironGenerationCost.textContent = ironCost.toLocaleString();
  if (ui.ironGenerationLevel) ui.ironGenerationLevel.textContent = getOreGenerationLevel("iron").toString();
  if (ui.ironGenerationStat) ui.ironGenerationStat.textContent = getOreGenerationStatText("iron");
  if (ui.buyIronGeneration) ui.buyIronGeneration.disabled = !canAfford(ironCost);
  if (ui.buySilverGeneration) ui.buySilverGeneration.classList.toggle("hidden", !interactionState.oreSilverRevealed && getOreGenerationLevel("silver") === 0);
  if (ui.silverGenerationCost) ui.silverGenerationCost.textContent = silverCost.toLocaleString();
  if (ui.silverGenerationLevel) ui.silverGenerationLevel.textContent = getOreGenerationLevel("silver").toString();
  if (ui.silverGenerationStat) ui.silverGenerationStat.textContent = getOreGenerationStatText("silver");
  if (ui.buySilverGeneration) ui.buySilverGeneration.disabled = !canAfford(silverCost);
  if (ui.buyGoldGeneration) ui.buyGoldGeneration.classList.toggle("hidden", !interactionState.oreGoldRevealed && getOreGenerationLevel("gold") === 0);
  if (ui.goldGenerationCost) ui.goldGenerationCost.textContent = goldCost.toLocaleString();
  if (ui.goldGenerationLevel) ui.goldGenerationLevel.textContent = getOreGenerationLevel("gold").toString();
  if (ui.goldGenerationStat) ui.goldGenerationStat.textContent = getOreGenerationStatText("gold");
  if (ui.buyGoldGeneration) ui.buyGoldGeneration.disabled = !canAfford(goldCost);

  renderMap();
  renderUpgradesAccordion();
  renderResourceStatsPanel();
  renderResourceLegend();
  renderMinerRing();
  renderMinerStatsPanel();
  renderMinerPopup();
}

function gameLoop(): void {
  const now = Date.now();
  const deltaSeconds = (now - state.lastTick) / 1000;
  state.lastTick = now;
  runIdleMiners(deltaSeconds);
  render();
}

bindUiEvents({
  ui,
  state,
  interactionState,
  setSettingsModalOpen,
  closeMinerPanels,
  closeResourceStatsPanel,
  setClassModalOpen,
  activateTile: (tile) => {
    activateTile(tile);
  },
  openMinerPanels,
  moveMinerToPointer,
  render,
  buyMinerSpeedUpgrade,
  buyMinerRadiusUpgrade,
  toggleMinerRepositionMode,
  closeMinerUpgradePanel,
  closeMinerStatsPanel,
  toggleUpgradesAccordion,
  toggleResourceStatsPanel,
  buyIdleMiner,
  buyMapExpansion,
  buyCoalGeneration,
  buyCopperGeneration,
  buyIronGeneration,
  buySilverGeneration,
  buyGoldGeneration,
  buyDoubleActivationMin,
  buyDoubleActivationMax,
  buyVeinFinderUpgrade,
  buyCritChanceUpgrade,
  buyCritMultiplierUpgrade,
  buyChainReactionUpgrade,
  unlockClassChoice,
  selectMinerSpecialization,
  setMinerTargeting,
  saveGame,
  resetGame,
});

loadGame();
state.lastTick = Date.now();
render();

setInterval(gameLoop, 100);
setInterval(() => saveGame(false), 10000);

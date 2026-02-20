// Constants
const SAVE_KEY = "numis-idle-save-v1";
const TILE_SIZE_PX = 38;
const TILE_GAP_PX = 6;
const BASE_MINER_EFFECT_RADIUS_PX = 22.5;
const MIN_TILE_COVERAGE_IN_RADIUS = 0.3;
const SPECIALIZATION_COST = 250;

// Type definitions
interface MinerUpgrade {
  speedLevel: number;
  radiusLevel: number;
  doubleActivationMinLevel: number;
  doubleActivationMaxLevel: number;
  veinFinderLevel: number;
  critChanceLevel: number;
  critMultiplierLevel: number;
  chainReactionLevel: number;
  specializationUnlocked: boolean;
  specialization: MinerSpecialization;
  targeting: MinerTargeting;
}

interface Position {
  x: number;
  y: number;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface UpgradeConfig {
  baseCost: number;
  growth: number;
  bonusClicksPerSecond?: number;
  triggerIntervalSeconds?: number;
  radiusMultiplierPerLevel?: number;
}

interface GameState {
  coins: number;
  idleMinerOwned: number;
  mapExpansions: number;
  coalGenerationLevel: number;
  copperGenerationLevel: number;
  ironGenerationLevel: number;
  silverGenerationLevel: number;
  goldGenerationLevel: number;
  lastTick: number;
  lastRenderedMapSize: number;
  idleMinerCooldowns: number[];
  idleMinerPositions: (Position | null)[];
  idleMinerUpgrades: MinerUpgrade[];
}

type OreType = "sand" | "coal" | "copper" | "iron" | "silver" | "gold";
type UpgradableOre = Exclude<OreType, "sand">;
type MinerSpecialization = "none" | "vein-finder" | "crit" | "chain-lightning" | "double-activation";
type MinerTargeting = "random" | "high-quality" | "low-quality";

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
  coalGenerationLevel: 0,
  copperGenerationLevel: 0,
  ironGenerationLevel: 0,
  silverGenerationLevel: 0,
  goldGenerationLevel: 0,
  lastTick: Date.now(),
  lastRenderedMapSize: 0,
  idleMinerCooldowns: [],
  idleMinerPositions: [],
  idleMinerUpgrades: [],
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

const coalGenerationUpgrade: UpgradeConfig = {
  baseCost: 75,
  growth: 1.25,
};

const copperGenerationUpgrade: UpgradeConfig = {
  baseCost: 120,
  growth: 1.28,
};

const ironGenerationUpgrade: UpgradeConfig = {
  baseCost: 220,
  growth: 1.31,
};

const silverGenerationUpgrade: UpgradeConfig = {
  baseCost: 420,
  growth: 1.34,
};

const goldGenerationUpgrade: UpgradeConfig = {
  baseCost: 800,
  growth: 1.38,
};

const BASE_ORE_WEIGHTS: Record<OreType, number> = {
  sand: 9200,
  coal: 600,
  copper: 140,
  iron: 45,
  silver: 12,
  gold: 3,
};

const ORE_REWARDS: Record<OreType, number> = {
  sand: 1,
  coal: 3,
  copper: 10,
  iron: 25,
  silver: 66,
  gold: 200,
};

const ORE_ORDER: OreType[] = ["sand", "coal", "copper", "iron", "silver", "gold"];

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

function getMapPixelSize(mapSize: number): number {
  return mapSize * TILE_SIZE_PX + (mapSize - 1) * TILE_GAP_PX;
}

function getMapExpansionCost(): number {
  const nextUpgradeCount = state.mapExpansions + 1;
  return 10 * nextUpgradeCount ** 3;
}

function getIdleMinerCost(): number {
  const nextCount = state.idleMinerOwned + 1;
  return idleMiner.baseCost * nextCount ** 3;
}

function getMinerUpgrade(minerIndex: number): MinerUpgrade {
  const upgrade = state.idleMinerUpgrades[minerIndex];
  if (!upgrade) {
    return {
      speedLevel: 0,
      radiusLevel: 0,
      doubleActivationMinLevel: 0,
      doubleActivationMaxLevel: 0,
      veinFinderLevel: 0,
      critChanceLevel: 0,
      critMultiplierLevel: 0,
      chainReactionLevel: 0,
      specializationUnlocked: false,
      specialization: "none",
      targeting: "random",
    };
  }
  return {
    speedLevel: Number(upgrade.speedLevel) || 0,
    radiusLevel: Number(upgrade.radiusLevel) || 0,
    doubleActivationMinLevel: Number(upgrade.doubleActivationMinLevel) || 0,
    doubleActivationMaxLevel: Number(upgrade.doubleActivationMaxLevel) || 0,
    veinFinderLevel: Number(upgrade.veinFinderLevel) || 0,
    critChanceLevel: Number(upgrade.critChanceLevel) || 0,
    critMultiplierLevel: Number(upgrade.critMultiplierLevel) || 0,
    chainReactionLevel: Number(upgrade.chainReactionLevel) || 0,
    specializationUnlocked: Boolean(upgrade.specializationUnlocked),
    specialization: (upgrade.specialization as MinerSpecialization) || "none",
    targeting: (upgrade.targeting as MinerTargeting) || "random",
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
  switch (ore) {
    case "coal":
      return coalGenerationUpgrade;
    case "copper":
      return copperGenerationUpgrade;
    case "iron":
      return ironGenerationUpgrade;
    case "silver":
      return silverGenerationUpgrade;
    case "gold":
      return goldGenerationUpgrade;
  }
}

function getOreGenerationLevel(ore: UpgradableOre): number {
  switch (ore) {
    case "coal":
      return state.coalGenerationLevel;
    case "copper":
      return state.copperGenerationLevel;
    case "iron":
      return state.ironGenerationLevel;
    case "silver":
      return state.silverGenerationLevel;
    case "gold":
      return state.goldGenerationLevel;
  }
}

function setOreGenerationLevel(ore: UpgradableOre, level: number): void {
  switch (ore) {
    case "coal":
      state.coalGenerationLevel = level;
      return;
    case "copper":
      state.copperGenerationLevel = level;
      return;
    case "iron":
      state.ironGenerationLevel = level;
      return;
    case "silver":
      state.silverGenerationLevel = level;
      return;
    case "gold":
      state.goldGenerationLevel = level;
      return;
  }
}

function getOreWeightForLevel(ore: OreType, level: number): number {
  const baseWeight = BASE_ORE_WEIGHTS[ore];
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
  return ORE_REWARDS[tileType] || 1;
}

function getOreDisplayName(ore: OreType): string {
  return ore.charAt(0).toUpperCase() + ore.slice(1);
}

function renderResourceLegend(): void {
  if (!ui.resourceLegendBody) {
    return;
  }

  const weights = ORE_ORDER.map((ore) => ({ ore, weight: getOreEffectiveWeight(ore) }));
  const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0);

  ui.resourceLegendBody.innerHTML = weights
    .map(({ ore, weight }) => {
      const chancePercent = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
      const chanceText = chancePercent < 0.1 ? chancePercent.toFixed(3) : chancePercent.toFixed(2);
      return `<p class="resource-legend-row"><span>${getOreDisplayName(ore)}</span><span>${chanceText}%</span><span>${getTileCoinValue(ore)}</span></p>`;
    })
    .join("");
}

function getDoubleActivationMinCost(minerIndex: number): number {
  return getUpgradeCost(doubleActivationMinUpgrade, getMinerUpgrade(minerIndex).doubleActivationMinLevel);
}

function getDoubleActivationMaxCost(minerIndex: number): number {
  return getUpgradeCost(doubleActivationMaxUpgrade, getMinerUpgrade(minerIndex).doubleActivationMaxLevel);
}

function getVeinFinderCost(minerIndex: number): number {
  return getUpgradeCost(veinFinderUpgrade, getMinerUpgrade(minerIndex).veinFinderLevel);
}

function getCritChanceCost(minerIndex: number): number {
  return getUpgradeCost(critChanceUpgrade, getMinerUpgrade(minerIndex).critChanceLevel);
}

function getCritMultiplierCost(minerIndex: number): number {
  return getUpgradeCost(critMultiplierUpgrade, getMinerUpgrade(minerIndex).critMultiplierLevel);
}

function getChainReactionCost(minerIndex: number): number {
  return getUpgradeCost(chainReactionUpgrade, getMinerUpgrade(minerIndex).chainReactionLevel);
}

function getDoubleActivationMinPercent(minerIndex: number): number {
  if (!canUseClass(minerIndex, "double-activation")) {
    return 0;
  }
  return 0.1 + getMinerUpgrade(minerIndex).doubleActivationMinLevel * 0.1;
}

function getDoubleActivationMaxPercent(minerIndex: number): number {
  if (!canUseClass(minerIndex, "double-activation")) {
    return 0;
  }
  return 0.2 + getMinerUpgrade(minerIndex).doubleActivationMaxLevel * 0.2;
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
  if (!canUseClass(minerIndex, "vein-finder")) {
    return 1;
  }
  return 1.25 + getMinerUpgrade(minerIndex).veinFinderLevel * 0.25;
}

function getVeinFinderStatText(minerIndex: number): string {
  const level = getMinerUpgrade(minerIndex).veinFinderLevel;
  const currentBoost = (getVeinFinderQualityMultiplier(minerIndex) - 1) * 100;
  const nextBoost = (1 + (level + 1) * 0.25 - 1) * 100;
  return `Current boost: +${currentBoost.toFixed(0)}% → Upgrading to: +${nextBoost.toFixed(0)}% for mined ore respawn weight`;
}

function getCritChance(minerIndex: number): number {
  if (!canUseClass(minerIndex, "crit")) {
    return 0;
  }
  return Math.min(0.6, 0.1 + getMinerUpgrade(minerIndex).critChanceLevel * 0.03);
}

function getCritMultiplier(minerIndex: number): number {
  return 2 + getMinerUpgrade(minerIndex).critMultiplierLevel * 0.2;
}

function getChainReactionChance(minerIndex: number): number {
  if (!canUseClass(minerIndex, "chain-lightning")) {
    return 0;
  }
  return 0.1;
}

function getChainReactionLength(minerIndex: number): number {
  if (!canUseClass(minerIndex, "chain-lightning")) {
    return 0;
  }
  return 1 + getMinerUpgrade(minerIndex).chainReactionLevel;
}

function getCritChanceStatText(minerIndex: number): string {
  const current = (getCritChance(minerIndex) * 100).toFixed(0);
  const level = getMinerUpgrade(minerIndex).critChanceLevel;
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

function getSpecializationLabel(value: MinerSpecialization): string {
  switch (value) {
    case "vein-finder":
      return "🧭 Vein Finder";
    case "crit":
      return "🎯 Critical Strike";
    case "chain-lightning":
      return "Chain Lightning";
    case "double-activation":
      return "⏩ Double Activation";
    default:
      return "None";
  }
}

function getMinerDisplayName(minerIndex: number): string {
  const spec = getMinerUpgrade(minerIndex).specialization;
  const number = minerIndex + 1;
  if (spec === "none") {
    return `Miner ${number}`;
  }
  return `${getSpecializationLabel(spec)} Miner ${number}`;
}

function getMinerRingLabel(minerIndex: number): string {
  const upgrade = getMinerUpgrade(minerIndex);
  if (upgrade.specialization === "vein-finder") {
    return `🧭${minerIndex + 1}`;
  }
  if (upgrade.specialization === "crit") {
    return `🎯${minerIndex + 1}`;
  }
  if (upgrade.specialization === "chain-lightning") {
    return `⚡${minerIndex + 1}`;
  }
  if (upgrade.specialization === "double-activation") {
    return `⏩${minerIndex + 1}`;
  }
  return `M${minerIndex + 1}`;
}

function canOfferClassUnlock(minerIndex: number): boolean {
  const upgrade = getMinerUpgrade(minerIndex);
  return !upgrade.specializationUnlocked && upgrade.specialization === "none" && getMinerClicksPerSecond(minerIndex) >= 1;
}

function canChooseSpecialization(minerIndex: number): boolean {
  const upgrade = getMinerUpgrade(minerIndex);
  return upgrade.specializationUnlocked && upgrade.specialization === "none";
}

function canUseClass(minerIndex: number, spec: MinerSpecialization): boolean {
  const selected = getMinerUpgrade(minerIndex).specialization;
  return selected === spec;
}

function selectMinerSpecialization(spec: Exclude<MinerSpecialization, "none">): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null || !canChooseSpecialization(minerIndex)) {
    return;
  }
  state.idleMinerUpgrades[minerIndex].specialization = spec;
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
  state.idleMinerUpgrades[minerIndex].specializationUnlocked = true;
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
  state.idleMinerUpgrades[minerIndex].targeting = mode;
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
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      coins: state.coins,
      idleMinerOwned: state.idleMinerOwned,
      idleMinerCooldowns: state.idleMinerCooldowns,
      idleMinerPositions: state.idleMinerPositions,
      idleMinerUpgrades: state.idleMinerUpgrades,
      mapExpansions: state.mapExpansions,
      coalGenerationLevel: state.coalGenerationLevel,
      copperGenerationLevel: state.copperGenerationLevel,
      ironGenerationLevel: state.ironGenerationLevel,
      silverGenerationLevel: state.silverGenerationLevel,
      goldGenerationLevel: state.goldGenerationLevel,
      savedAt: Date.now(),
    })
  );

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

  while (state.idleMinerUpgrades.length < state.idleMinerOwned) {
    state.idleMinerUpgrades.push({
      speedLevel: 0,
      radiusLevel: 0,
      doubleActivationMinLevel: 0,
      doubleActivationMaxLevel: 0,
      veinFinderLevel: 0,
      critChanceLevel: 0,
      critMultiplierLevel: 0,
      chainReactionLevel: 0,
      specializationUnlocked: false,
      specialization: "none",
      targeting: "random",
    });
  }
  if (state.idleMinerUpgrades.length > state.idleMinerOwned) {
    state.idleMinerUpgrades.length = state.idleMinerOwned;
  }

  if (interactionState.selectedMinerIndex !== null && interactionState.selectedMinerIndex >= state.idleMinerOwned) {
    closeMinerPanels();
  }
}

function loadGame(): void {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    state.coins = Number(parsed.coins) || 0;
    state.idleMinerOwned = Number(parsed.idleMinerOwned ?? (parsed as Record<string, unknown>).cursorOwned) || 0;

    state.idleMinerCooldowns = Array.isArray(parsed.idleMinerCooldowns)
      ? parsed.idleMinerCooldowns.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value >= 0)
      : [];

    state.idleMinerPositions = Array.isArray(parsed.idleMinerPositions)
      ? parsed.idleMinerPositions
          .map((position: unknown) => {
            if (!position || typeof position !== "object") {
              return null;
            }
            const x = Number((position as Record<string, unknown>).x);
            const y = Number((position as Record<string, unknown>).y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) {
              return null;
            }
            return { x, y };
          })
          .filter((position) => position !== null)
      : [];

    const legacySpeedLevel = Number((parsed as Record<string, unknown>).fasterMinerOwned ?? (parsed as Record<string, unknown>).minerOwned) || 0;
    const legacyRadiusLevel = Number((parsed as Record<string, unknown>).minerRadiusOwned) || 0;

    state.idleMinerUpgrades = Array.isArray(parsed.idleMinerUpgrades)
      ? parsed.idleMinerUpgrades
          .map((upgrade: unknown) => {
            const u = upgrade as Record<string, unknown>;
            return {
              speedLevel: Number(u?.speedLevel) || 0,
              radiusLevel: Number(u?.radiusLevel) || 0,
              doubleActivationMinLevel: Number(u?.doubleActivationMinLevel) || 0,
              doubleActivationMaxLevel: Number(u?.doubleActivationMaxLevel) || 0,
              veinFinderLevel: Number(u?.veinFinderLevel) || 0,
              critChanceLevel: Number(u?.critChanceLevel) || 0,
              critMultiplierLevel: Number(u?.critMultiplierLevel) || 0,
              chainReactionLevel: Number(u?.chainReactionLevel) || 0,
              specializationUnlocked: Boolean(u?.specializationUnlocked),
              specialization: (u?.specialization as MinerSpecialization) || "none",
              targeting: (u?.targeting as MinerTargeting) || "random",
            };
          })
          .filter((upgrade) => upgrade.speedLevel >= 0 && upgrade.radiusLevel >= 0)
      : [];

    if (state.idleMinerUpgrades.length === 0 && state.idleMinerOwned > 0) {
      for (let index = 0; index < state.idleMinerOwned; index += 1) {
        state.idleMinerUpgrades.push({
          speedLevel: legacySpeedLevel,
          radiusLevel: legacyRadiusLevel,
          doubleActivationMinLevel: 0,
          doubleActivationMaxLevel: 0,
          veinFinderLevel: 0,
          critChanceLevel: 0,
          critMultiplierLevel: 0,
          chainReactionLevel: 0,
          specializationUnlocked: false,
          specialization: "none",
          targeting: "random",
        });
      }
    }

    state.mapExpansions = Number(parsed.mapExpansions) || 0;
    state.coalGenerationLevel = Number(parsed.coalGenerationLevel) || 0;
    state.copperGenerationLevel = Number(parsed.copperGenerationLevel) || 0;
    state.ironGenerationLevel = Number(parsed.ironGenerationLevel) || 0;
    state.silverGenerationLevel = Number(parsed.silverGenerationLevel) || 0;
    state.goldGenerationLevel = Number(parsed.goldGenerationLevel) || 0;
    syncIdleMinerState();

    const now = Date.now();
    const savedAt = Number(parsed.savedAt) || now;
    const secondsAway = Math.min((now - savedAt) / 1000, 8 * 60 * 60);
    const awayCoins = round(getCoinsPerSecond() * secondsAway, 0);
    state.coins += awayCoins;

    setStatus(`Welcome back! Earned ${awayCoins.toLocaleString()} while away.`);
  } catch {
    setStatus("Save data was invalid and has been ignored.");
  }
}

function getDefaultMinerPosition(index: number, count: number): Position {
  const mapSize = getMapSize();
  const mapPixelSize = getMapPixelSize(mapSize);
  const ringRadius = Math.max(26, mapPixelSize * 0.28);
  const angle = (index / Math.max(1, count)) * (Math.PI * 2) - Math.PI / 2;
  return {
    x: Math.cos(angle) * ringRadius,
    y: Math.sin(angle) * ringRadius,
  };
}

function getMinerPosition(minerIndex: number): Position {
  const position = state.idleMinerPositions[minerIndex];
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    return position;
  }
  return getDefaultMinerPosition(minerIndex, state.idleMinerOwned);
}

function getTileBoundsByIndex(tileIndex: number, mapSize: number): Bounds {
  const column = tileIndex % mapSize;
  const row = Math.floor(tileIndex / mapSize);
  const mapPixelSize = getMapPixelSize(mapSize);
  const left = -mapPixelSize / 2 + column * (TILE_SIZE_PX + TILE_GAP_PX);
  const top = -mapPixelSize / 2 + row * (TILE_SIZE_PX + TILE_GAP_PX);
  return {
    left,
    top,
    right: left + TILE_SIZE_PX,
    bottom: top + TILE_SIZE_PX,
  };
}

function getTileCoverageInMinerRadius(minerPosition: Position, tileBounds: Bounds, radiusPx: number): number {
  const sampleCountPerAxis = 5;
  const totalSamples = sampleCountPerAxis * sampleCountPerAxis;
  const step = TILE_SIZE_PX / sampleCountPerAxis;
  const radiusSquared = radiusPx * radiusPx;
  let insideSamples = 0;

  for (let row = 0; row < sampleCountPerAxis; row += 1) {
    for (let column = 0; column < sampleCountPerAxis; column += 1) {
      const sampleX = tileBounds.left + (column + 0.5) * step;
      const sampleY = tileBounds.top + (row + 0.5) * step;
      const dx = sampleX - minerPosition.x;
      const dy = sampleY - minerPosition.y;
      if (dx * dx + dy * dy <= radiusSquared) {
        insideSamples += 1;
      }
    }
  }

  return insideSamples / totalSamples;
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
  if (!ui.resourceStatsPanel || !ui.resourceStatsToggle) {
    return;
  }
  ui.resourceStatsPanel.classList.toggle("hidden", !interactionState.resourceStatsOpen);
  ui.resourceStatsToggle.setAttribute("aria-expanded", String(interactionState.resourceStatsOpen));
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
  if (ui.upgradesAccordionBody) {
    ui.upgradesAccordionBody.classList.toggle("hidden", !interactionState.upgradesAccordionOpen);
  }
  if (ui.toggleUpgradesAccordion) {
    ui.toggleUpgradesAccordion.textContent = interactionState.upgradesAccordionOpen ? "▾" : "▸";
    ui.toggleUpgradesAccordion.setAttribute("aria-expanded", String(interactionState.upgradesAccordionOpen));
    ui.toggleUpgradesAccordion.setAttribute(
      "aria-label",
      interactionState.upgradesAccordionOpen ? "Collapse upgrades" : "Expand upgrades"
    );
  }
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
  state.idleMinerUpgrades[minerIndex].speedLevel += 1;
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
  state.idleMinerUpgrades[minerIndex].radiusLevel += 1;
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
  localStorage.removeItem(SAVE_KEY);
  state.coins = 0;
  state.idleMinerOwned = 0;
  state.mapExpansions = 0;
  state.coalGenerationLevel = 0;
  state.copperGenerationLevel = 0;
  state.ironGenerationLevel = 0;
  state.silverGenerationLevel = 0;
  state.goldGenerationLevel = 0;
  state.lastTick = Date.now();
  state.lastRenderedMapSize = 0;
  state.idleMinerCooldowns = [];
  state.idleMinerPositions = [];
  state.idleMinerUpgrades = [];
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
  if (!canUseClass(minerIndex, "double-activation")) return;
  const cost = getDoubleActivationMinCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].doubleActivationMinLevel += 1;
  render();
}

function buyDoubleActivationMax(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "double-activation")) return;
  const cost = getDoubleActivationMaxCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].doubleActivationMaxLevel += 1;
  render();
}

function buyVeinFinderUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "vein-finder")) return;
  const cost = getVeinFinderCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].veinFinderLevel += 1;
  render();
}

function buyCritChanceUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "crit")) return;
  const cost = getCritChanceCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].critChanceLevel += 1;
  render();
}

function buyCritMultiplierUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "crit")) return;
  const cost = getCritMultiplierCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].critMultiplierLevel += 1;
  render();
}

function buyChainReactionUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) return;
  if (!canUseClass(minerIndex, "chain-lightning")) return;
  const cost = getChainReactionCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].chainReactionLevel += 1;
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function moveMinerToPointer(clientX: number, clientY: number): void {
  const minerIndex = interactionState.activeMinerIndex;
  if (minerIndex === null || !ui.mapEnvironment) {
    return;
  }

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
  if (!ui.minerPopup) return;
  const minerIndex = interactionState.selectedMinerIndex;
  if (!interactionState.upgradePanelOpen || minerIndex === null || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
    ui.minerPopup.classList.add("hidden");
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
  const showDoubleActivation = selectedSpec === "double-activation";
  const showVeinFinder = selectedSpec === "vein-finder";
  const showCrit = selectedSpec === "crit";
  const showChainLightning = selectedSpec === "chain-lightning";

  ui.minerPopup.classList.remove("hidden");
  if (ui.minerPopupTitle) ui.minerPopupTitle.textContent = getMinerDisplayName(minerIndex);
  if (ui.popupSpeedLevel) ui.popupSpeedLevel.textContent = upgrade.speedLevel.toString();
  if (ui.popupRadiusLevel) ui.popupRadiusLevel.textContent = upgrade.radiusLevel.toString();
  if (ui.popupDoubleActivationMinLevel) ui.popupDoubleActivationMinLevel.textContent = upgrade.doubleActivationMinLevel.toString();
  if (ui.popupDoubleActivationMaxLevel) ui.popupDoubleActivationMaxLevel.textContent = upgrade.doubleActivationMaxLevel.toString();
  if (ui.popupVeinFinderLevel) ui.popupVeinFinderLevel.textContent = upgrade.veinFinderLevel.toString();
  if (ui.popupCritChanceLevel) ui.popupCritChanceLevel.textContent = upgrade.critChanceLevel.toString();
  if (ui.popupCritMultiplierLevel) ui.popupCritMultiplierLevel.textContent = upgrade.critMultiplierLevel.toString();
  if (ui.popupChainReactionLevel) ui.popupChainReactionLevel.textContent = upgrade.chainReactionLevel.toString();
  if (ui.popupSpeedCost) ui.popupSpeedCost.textContent = speedCost.toLocaleString();
  if (ui.popupRadiusCost) ui.popupRadiusCost.textContent = radiusCost.toLocaleString();
  if (ui.popupDoubleActivationMinCost) ui.popupDoubleActivationMinCost.textContent = doubleActivationMinCost.toLocaleString();
  if (ui.popupDoubleActivationMaxCost) ui.popupDoubleActivationMaxCost.textContent = doubleActivationMaxCost.toLocaleString();
  if (ui.popupVeinFinderCost) ui.popupVeinFinderCost.textContent = veinFinderCost.toLocaleString();
  if (ui.popupCritChanceCost) ui.popupCritChanceCost.textContent = critChanceCost.toLocaleString();
  if (ui.popupCritMultiplierCost) ui.popupCritMultiplierCost.textContent = critMultiplierCost.toLocaleString();
  if (ui.popupChainReactionCost) ui.popupChainReactionCost.textContent = chainReactionCost.toLocaleString();
  if (ui.popupSpeedStat) ui.popupSpeedStat.textContent = getMinerSpeedStatText(minerIndex);
  if (ui.popupRadiusStat) ui.popupRadiusStat.textContent = getMinerRadiusStatText(minerIndex);
  if (ui.popupDoubleActivationMinStat) ui.popupDoubleActivationMinStat.textContent = getDoubleActivationMinStatText(minerIndex);
  if (ui.popupDoubleActivationMaxStat) ui.popupDoubleActivationMaxStat.textContent = getDoubleActivationMaxStatText(minerIndex);
  if (ui.popupVeinFinderStat) ui.popupVeinFinderStat.textContent = getVeinFinderStatText(minerIndex);
  if (ui.popupCritChanceStat) ui.popupCritChanceStat.textContent = getCritChanceStatText(minerIndex);
  if (ui.popupCritMultiplierStat) ui.popupCritMultiplierStat.textContent = getCritMultiplierStatText(minerIndex);
  if (ui.popupChainReactionStat) ui.popupChainReactionStat.textContent = getChainReactionStatText(minerIndex);
  if (ui.popupSpecStatus) {
    if (selectedSpec !== "none") {
      ui.popupSpecStatus.textContent = `Specialization: ${getSpecializationLabel(selectedSpec)}`;
    } else if (canSpec) {
      ui.popupSpecStatus.textContent = "Class unlocked. Choose specialization";
    } else if (canUnlockClass) {
      ui.popupSpecStatus.textContent = `Unlock class for ${SPECIALIZATION_COST} coins`;
    } else {
      ui.popupSpecStatus.textContent = "Unlocks at 1.00 act/sec";
    }
  }

  if (ui.popupUnlockClass) {
    ui.popupUnlockClass.classList.toggle("hidden", !canUnlockClass);
    ui.popupUnlockClass.disabled = !canUnlockClass || !specAffordable;
  }
  if (ui.popupChooseClass) {
    ui.popupChooseClass.classList.toggle("hidden", !canSpec);
    ui.popupChooseClass.disabled = !canSpec;
  }

  if (ui.popupTargetingRandom) {
    ui.popupTargetingRandom.disabled = upgrade.targeting === "random";
  }
  if (ui.popupTargetingHigh) {
    ui.popupTargetingHigh.disabled = upgrade.targeting === "high-quality";
  }
  if (ui.popupTargetingLow) {
    ui.popupTargetingLow.disabled = upgrade.targeting === "low-quality";
  }

  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.classList.toggle("hidden", !showDoubleActivation);
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.classList.toggle("hidden", !showDoubleActivation);
  if (ui.popupUpgradeVeinFinder) ui.popupUpgradeVeinFinder.classList.toggle("hidden", !showVeinFinder);
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.classList.toggle("hidden", !showCrit);
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.classList.toggle("hidden", !showCrit);
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.classList.toggle("hidden", !showChainLightning);

  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.disabled = !canAfford(speedCost);
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.disabled = !canAfford(radiusCost);
  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.disabled = !canAfford(doubleActivationMinCost) || !canUseClass(minerIndex, "double-activation");
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.disabled = !canAfford(doubleActivationMaxCost) || !canUseClass(minerIndex, "double-activation");
  if (ui.popupUpgradeVeinFinder) ui.popupUpgradeVeinFinder.disabled = !canAfford(veinFinderCost) || !canUseClass(minerIndex, "vein-finder");
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.disabled = !canAfford(critChanceCost) || !canUseClass(minerIndex, "crit");
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.disabled = !canAfford(critMultiplierCost) || !canUseClass(minerIndex, "crit");
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.disabled = !canAfford(chainReactionCost) || !canUseClass(minerIndex, "chain-lightning");
  if (ui.popupReposition) ui.popupReposition.textContent = interactionState.placementMode ? "Click map to place…" : "Reposition";
}

function renderMinerStatsPanel(): void {
  if (!ui.minerStatsPanel) return;
  const minerIndex = interactionState.selectedMinerIndex;
  if (!interactionState.statsPanelOpen || minerIndex === null || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
    ui.minerStatsPanel.classList.add("hidden");
    return;
  }

  const upgrade = getMinerUpgrade(minerIndex);
  const position = getMinerPosition(minerIndex);
  const clicksPerSecond = getMinerClicksPerSecond(minerIndex);
  const cooldownSeconds = getMinerCooldownSeconds(minerIndex);
  const radiusPx = getMinerEffectRadiusPx(minerIndex);
  const minPercent = Math.round(getDoubleActivationMinPercent(minerIndex) * 100);
  const maxPercent = Math.round(getDoubleActivationMaxPercent(minerIndex) * 100);

  ui.minerStatsPanel.classList.remove("hidden");
  if (ui.minerStatsTitle) ui.minerStatsTitle.textContent = `${getMinerDisplayName(minerIndex)} Stats`;
  if (ui.statsMinerPosition) ui.statsMinerPosition.textContent = `${Math.round(position.x)}, ${Math.round(position.y)}`;
  if (ui.statsMinerRate) ui.statsMinerRate.textContent = `${clicksPerSecond.toFixed(2)} act/sec`;
  if (ui.statsMinerCooldown) ui.statsMinerCooldown.textContent = `${cooldownSeconds.toFixed(2)}s`;
  if (ui.statsMinerRadius) ui.statsMinerRadius.textContent = `${Math.round(radiusPx)}px`;
  if (ui.statsMinerSpeedLevel) ui.statsMinerSpeedLevel.textContent = upgrade.speedLevel.toString();
  if (ui.statsMinerRadiusLevel) ui.statsMinerRadiusLevel.textContent = upgrade.radiusLevel.toString();
  if (ui.statsDoubleActivationRange) ui.statsDoubleActivationRange.textContent = `${minPercent}%-${maxPercent}%`;
}

function runIdleMiners(deltaSeconds: number): void {
  if (state.idleMinerOwned <= 0) {
    state.idleMinerCooldowns = [];
    return;
  }

  syncIdleMinerState();
  let activations = 0;
  const maxTriggersPerMinerPerTick = 25;
  const mapSize = getMapSize();

  for (let minerIndex = 0; minerIndex < state.idleMinerCooldowns.length; minerIndex += 1) {
    const cooldown = getMinerCooldownSeconds(minerIndex);
    if (!Number.isFinite(cooldown) || cooldown <= 0) {
      continue;
    }

    state.idleMinerCooldowns[minerIndex] -= deltaSeconds;
    let triggerCount = 0;

    while (state.idleMinerCooldowns[minerIndex] <= 0 && triggerCount < maxTriggersPerMinerPerTick) {
      state.idleMinerCooldowns[minerIndex] += cooldown;
      triggerCount += 1;

      if (!ui.mapGrid) continue;
      const availableTiles = Array.from(ui.mapGrid.querySelectorAll(".map-tile:not(.map-tile--cooldown)")) as HTMLElement[];
      if (availableTiles.length === 0) {
        continue;
      }

      const eligibleTiles = getEligibleTilesForMiner(minerIndex, availableTiles, mapSize);
      if (eligibleTiles.length === 0) {
        continue;
      }

      const tile = chooseTargetTile(minerIndex, eligibleTiles);
      if (activateTile(tile, false, minerIndex)) {
        activations += 1;
        activations += triggerChainReaction(minerIndex, tile, mapSize);

        // Double activation: always roll within min/max range
        const roll = rollDoubleActivation(minerIndex);
        const bonusActivations = getActivationCountFromRoll(roll);

        // Activate bonus tiles
        for (let i = 0; i < bonusActivations; i++) {
          const bonusTiles = getEligibleTilesForMiner(
            minerIndex,
            availableTiles,
            mapSize
          );
          if (bonusTiles.length > 0) {
            const randomBonusIndex = Math.floor(Math.random() * bonusTiles.length);
            if (activateTile(bonusTiles[randomBonusIndex], false, minerIndex)) {
              activations += 1;
              activations += triggerChainReaction(minerIndex, bonusTiles[randomBonusIndex], mapSize);
            }
          }
        }
      }
    }
  }

  if (activations > 0) {
    render();
  }
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

  if (!interactionState.oreCopperRevealed && state.coalGenerationLevel > 0 && state.coins >= copperCost / 2) {
    interactionState.oreCopperRevealed = true;
  }
  if (!interactionState.oreIronRevealed && state.copperGenerationLevel > 0 && state.coins >= ironCost / 2) {
    interactionState.oreIronRevealed = true;
  }
  if (!interactionState.oreSilverRevealed && state.ironGenerationLevel > 0 && state.coins >= silverCost / 2) {
    interactionState.oreSilverRevealed = true;
  }
  if (!interactionState.oreGoldRevealed && state.silverGenerationLevel > 0 && state.coins >= goldCost / 2) {
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
  if (ui.coalGenerationLevel) ui.coalGenerationLevel.textContent = state.coalGenerationLevel.toString();
  if (ui.coalGenerationStat) ui.coalGenerationStat.textContent = getOreGenerationStatText("coal");
  if (ui.buyCoalGeneration) ui.buyCoalGeneration.disabled = !canAfford(coalCost);
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.classList.toggle("hidden", !interactionState.oreCopperRevealed && state.copperGenerationLevel === 0);
  if (ui.copperGenerationCost) ui.copperGenerationCost.textContent = copperCost.toLocaleString();
  if (ui.copperGenerationLevel) ui.copperGenerationLevel.textContent = state.copperGenerationLevel.toString();
  if (ui.copperGenerationStat) ui.copperGenerationStat.textContent = getOreGenerationStatText("copper");
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.disabled = !canAfford(copperCost);
  if (ui.buyIronGeneration) ui.buyIronGeneration.classList.toggle("hidden", !interactionState.oreIronRevealed && state.ironGenerationLevel === 0);
  if (ui.ironGenerationCost) ui.ironGenerationCost.textContent = ironCost.toLocaleString();
  if (ui.ironGenerationLevel) ui.ironGenerationLevel.textContent = state.ironGenerationLevel.toString();
  if (ui.ironGenerationStat) ui.ironGenerationStat.textContent = getOreGenerationStatText("iron");
  if (ui.buyIronGeneration) ui.buyIronGeneration.disabled = !canAfford(ironCost);
  if (ui.buySilverGeneration) ui.buySilverGeneration.classList.toggle("hidden", !interactionState.oreSilverRevealed && state.silverGenerationLevel === 0);
  if (ui.silverGenerationCost) ui.silverGenerationCost.textContent = silverCost.toLocaleString();
  if (ui.silverGenerationLevel) ui.silverGenerationLevel.textContent = state.silverGenerationLevel.toString();
  if (ui.silverGenerationStat) ui.silverGenerationStat.textContent = getOreGenerationStatText("silver");
  if (ui.buySilverGeneration) ui.buySilverGeneration.disabled = !canAfford(silverCost);
  if (ui.buyGoldGeneration) ui.buyGoldGeneration.classList.toggle("hidden", !interactionState.oreGoldRevealed && state.goldGenerationLevel === 0);
  if (ui.goldGenerationCost) ui.goldGenerationCost.textContent = goldCost.toLocaleString();
  if (ui.goldGenerationLevel) ui.goldGenerationLevel.textContent = state.goldGenerationLevel.toString();
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

// Event listeners
if (ui.settingsToggle) {
  ui.settingsToggle.addEventListener("click", () => {
    if (!ui.settingsModal) return;
    const isHidden = ui.settingsModal.classList.contains("hidden");
    setSettingsModalOpen(isHidden);
  });
}

if (ui.settingsModal) {
  ui.settingsModal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest(".modal-card")) {
      return;
    }
    setSettingsModalOpen(false);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSettingsModalOpen(false);
    closeMinerPanels();
    closeResourceStatsPanel();
    setClassModalOpen(false);
  }
});

const handleMapInteract = (event: PointerEvent): void => {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  event.preventDefault();

  // During placement mode, clicking finalizes the placement
  if (interactionState.placementMode && interactionState.selectedMinerIndex !== null) {
    // Position was already updated by pointermove, just finalize
    return;
  }

  // Normal tile activation
  if (!target.classList.contains("map-tile")) {
    return;
  }
  activateTile(target);
};

if (ui.mapGrid) {
  ui.mapGrid.addEventListener("pointerdown", handleMapInteract);
}

if (ui.minerRing) {
  ui.minerRing.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const node = target.closest(".miner-node") as HTMLElement | null;
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const minerIndex = Number(node.dataset.minerIndex);
    if (!Number.isInteger(minerIndex) || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
      return;
    }

    event.preventDefault();

    openMinerPanels(minerIndex);
  });
}

window.addEventListener("pointermove", (event) => {
  if (!interactionState.placementMode || interactionState.selectedMinerIndex === null || !ui.mapEnvironment) {
    return;
  }

  const envBounds = ui.mapEnvironment.getBoundingClientRect();
  const cursorX = event.clientX - envBounds.left - envBounds.width / 2;
  const cursorY = event.clientY - envBounds.top - envBounds.height / 2;
  const minerIndex = interactionState.selectedMinerIndex;

  state.idleMinerPositions[minerIndex] = { x: cursorX, y: cursorY };
  renderMinerRing();
});

window.addEventListener("pointerup", () => {
  if (interactionState.placementMode && interactionState.selectedMinerIndex !== null) {
    interactionState.placementMode = false;
    render();
  }
});

if (ui.mapEnvironment) {
  ui.mapEnvironment.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    // Don't close the popup when interacting with map tiles
    // The popup persists until X is clicked or another miner is selected
  });
}

if (ui.popupUpgradeSpeed) {
  ui.popupUpgradeSpeed.addEventListener("click", buyMinerSpeedUpgrade);
}
if (ui.popupUpgradeRadius) {
  ui.popupUpgradeRadius.addEventListener("click", buyMinerRadiusUpgrade);
}
if (ui.popupReposition) {
  ui.popupReposition.addEventListener("click", toggleMinerRepositionMode);
}
if (ui.closeMinerPopupButton) {
  ui.closeMinerPopupButton.addEventListener("click", closeMinerUpgradePanel);
}
if (ui.closeMinerStatsButton) {
  ui.closeMinerStatsButton.addEventListener("click", closeMinerStatsPanel);
}
if (ui.toggleUpgradesAccordion) {
  ui.toggleUpgradesAccordion.addEventListener("click", toggleUpgradesAccordion);
}
if (ui.resourceStatsToggle) {
  ui.resourceStatsToggle.addEventListener("click", toggleResourceStatsPanel);
}
if (ui.closeResourceStatsButton) {
  ui.closeResourceStatsButton.addEventListener("click", closeResourceStatsPanel);
}
if (ui.buyIdleMiner) {
  ui.buyIdleMiner.addEventListener("click", buyIdleMiner);
}
if (ui.expandMap) {
  ui.expandMap.addEventListener("click", buyMapExpansion);
}
if (ui.buyCoalGeneration) {
  ui.buyCoalGeneration.addEventListener("click", buyCoalGeneration);
}
if (ui.buyCopperGeneration) {
  ui.buyCopperGeneration.addEventListener("click", buyCopperGeneration);
}
if (ui.buyIronGeneration) {
  ui.buyIronGeneration.addEventListener("click", buyIronGeneration);
}
if (ui.buySilverGeneration) {
  ui.buySilverGeneration.addEventListener("click", buySilverGeneration);
}
if (ui.buyGoldGeneration) {
  ui.buyGoldGeneration.addEventListener("click", buyGoldGeneration);
}
if (ui.popupUpgradeDoubleActivationMin) {
  ui.popupUpgradeDoubleActivationMin.addEventListener("click", buyDoubleActivationMin);
}
if (ui.popupUpgradeDoubleActivationMax) {
  ui.popupUpgradeDoubleActivationMax.addEventListener("click", buyDoubleActivationMax);
}
if (ui.popupUpgradeVeinFinder) {
  ui.popupUpgradeVeinFinder.addEventListener("click", buyVeinFinderUpgrade);
}
if (ui.popupUpgradeCritChance) {
  ui.popupUpgradeCritChance.addEventListener("click", buyCritChanceUpgrade);
}
if (ui.popupUpgradeCritMultiplier) {
  ui.popupUpgradeCritMultiplier.addEventListener("click", buyCritMultiplierUpgrade);
}
if (ui.popupUpgradeChainReaction) {
  ui.popupUpgradeChainReaction.addEventListener("click", buyChainReactionUpgrade);
}
if (ui.popupUnlockClass) {
  ui.popupUnlockClass.addEventListener("click", unlockClassChoice);
}
if (ui.popupChooseClass) {
  ui.popupChooseClass.addEventListener("click", () => setClassModalOpen(true));
}
if (ui.classPickVeinFinder) {
  ui.classPickVeinFinder.addEventListener("click", () => selectMinerSpecialization("vein-finder"));
}
if (ui.classPickCrit) {
  ui.classPickCrit.addEventListener("click", () => selectMinerSpecialization("crit"));
}
if (ui.classPickChainLightning) {
  ui.classPickChainLightning.addEventListener("click", () => selectMinerSpecialization("chain-lightning"));
}
if (ui.classPickDoubleActivation) {
  ui.classPickDoubleActivation.addEventListener("click", () => selectMinerSpecialization("double-activation"));
}
if (ui.classModalClose) {
  ui.classModalClose.addEventListener("click", () => setClassModalOpen(false));
}
if (ui.classModal) {
  ui.classModal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest(".modal-card")) {
      return;
    }
    setClassModalOpen(false);
  });
}
if (ui.popupTargetingRandom) {
  ui.popupTargetingRandom.addEventListener("click", () => setMinerTargeting("random"));
}
if (ui.popupTargetingHigh) {
  ui.popupTargetingHigh.addEventListener("click", () => setMinerTargeting("high-quality"));
}
if (ui.popupTargetingLow) {
  ui.popupTargetingLow.addEventListener("click", () => setMinerTargeting("low-quality"));
}
if (ui.save) {
  ui.save.addEventListener("click", () => saveGame(true));
}
if (ui.reset) {
  ui.reset.addEventListener("click", resetGame);
}

loadGame();
state.lastTick = Date.now();
render();

setInterval(gameLoop, 100);
setInterval(() => saveGame(false), 10000);

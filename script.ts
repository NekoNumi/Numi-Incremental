// Constants
const SAVE_KEY = "numis-idle-save-v1";
const TILE_SIZE_PX = 38;
const TILE_GAP_PX = 6;
const BASE_MINER_EFFECT_RADIUS_PX = 22.5;
const MIN_TILE_COVERAGE_IN_RADIUS = 0.3;

// Type definitions
interface MinerUpgrade {
  speedLevel: number;
  radiusLevel: number;
  doubleActivationMinLevel: number;
  doubleActivationMaxLevel: number;
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
  areaMultiplierPerLevel?: number;
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

interface InteractionState {
  activeMinerIndex: number | null;
  selectedMinerIndex: number | null;
  repositionMode: boolean;
  placementMode: boolean;
  upgradePanelOpen: boolean;
  statsPanelOpen: boolean;
  resourceStatsOpen: boolean;
}

interface UIElements {
  coins: HTMLElement | null;
  perSecond: HTMLElement | null;
  idleMinerCost: HTMLElement | null;
  idleMinerOwned: HTMLElement | null;
  settingsToggle: HTMLElement | null;
  settingsModal: HTMLElement | null;
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
  upgradePanelOpen: false,
  statsPanelOpen: false,
  resourceStatsOpen: false,
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
  areaMultiplierPerLevel: 1.2,
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
  copper: 6,
  iron: 12,
  silver: 24,
  gold: 48,
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

// UI Element references
const ui: UIElements = {
  coins: document.getElementById("coins"),
  perSecond: document.getElementById("per-second"),
  idleMinerCost: document.getElementById("idle-miner-cost"),
  idleMinerOwned: document.getElementById("idle-miner-owned"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsModal: document.getElementById("settings-modal"),
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
  return idleMiner.baseCost * nextCount ** 2;
}

function getMinerUpgrade(minerIndex: number): MinerUpgrade {
  const upgrade = state.idleMinerUpgrades[minerIndex];
  if (!upgrade) {
    return { speedLevel: 0, radiusLevel: 0, doubleActivationMinLevel: 0, doubleActivationMaxLevel: 0 };
  }
  return {
    speedLevel: Number(upgrade.speedLevel) || 0,
    radiusLevel: Number(upgrade.radiusLevel) || 0,
    doubleActivationMinLevel: Number(upgrade.doubleActivationMinLevel) || 0,
    doubleActivationMaxLevel: Number(upgrade.doubleActivationMaxLevel) || 0,
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
  const multiplier = minerRadiusUpgrade.areaMultiplierPerLevel || 1.2;
  const areaMultiplier = multiplier ** upgrade.radiusLevel;
  return BASE_MINER_EFFECT_RADIUS_PX * Math.sqrt(areaMultiplier);
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

function getOreUpgradeMultiplier(level: number): number {
  if (level <= 0) {
    return 1;
  }
  return 1.05 + Math.max(0, level - 1) * 0.025;
}

function getOreGenerationCost(ore: UpgradableOre): number {
  return getUpgradeCost(getOreUpgradeConfig(ore), getOreGenerationLevel(ore));
}

function getOreEffectiveWeight(ore: OreType): number {
  const baseWeight = BASE_ORE_WEIGHTS[ore];
  if (ore === "sand") {
    return baseWeight;
  }
  const level = getOreGenerationLevel(ore);
  return Math.max(0.001, baseWeight * getOreUpgradeMultiplier(level));
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

  const totalWeight = weights.reduce((sum, entry) => sum + Math.max(0.001, entry.weight), 0);
  let roll = Math.random() * totalWeight;

  for (const entry of weights) {
    roll -= Math.max(0.001, entry.weight);
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

function getDoubleActivationMinPercent(minerIndex: number): number {
  return getMinerUpgrade(minerIndex).doubleActivationMinLevel * 0.05;
}

function getDoubleActivationMaxPercent(minerIndex: number): number {
  return getMinerUpgrade(minerIndex).doubleActivationMaxLevel * 0.1;
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
  const currentBonusPercent = (getOreUpgradeMultiplier(currentLevel) - 1) * 100;
  const nextBonusPercent = (getOreUpgradeMultiplier(currentLevel + 1) - 1) * 100;
  const currentWeight = getOreEffectiveWeight(ore);
  const nextWeight = BASE_ORE_WEIGHTS[ore] * getOreUpgradeMultiplier(currentLevel + 1);
  return `Weight: ${round(currentWeight, 2).toLocaleString()} → ${round(nextWeight, 2).toLocaleString()} (+${currentBonusPercent.toFixed(1)}% → +${nextBonusPercent.toFixed(1)}%)`;
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
  const currentMultiplier = (1 + upgrade.radiusLevel * 0.2).toFixed(1);
  const nextMultiplier = (1 + nextRadius * 0.2).toFixed(1);
  return `Current: ${currentMultiplier}x area → Upgrading to: ${nextMultiplier}x area`;
}

function getDoubleActivationMinStatText(minerIndex: number): string {
  const level = getMinerUpgrade(minerIndex).doubleActivationMinLevel;
  const current = (level * 0.05 * 100).toFixed(0);
  const next = ((level + 1) * 0.05 * 100).toFixed(0);
  return `Current min: ${current}% → Upgrading to: ${next}%`;
}

function getDoubleActivationMaxStatText(minerIndex: number): string {
  const level = getMinerUpgrade(minerIndex).doubleActivationMaxLevel;
  const current = (level * 0.1 * 100).toFixed(0);
  const next = ((level + 1) * 0.1 * 100).toFixed(0);
  return `Current max: ${current}% → Upgrading to: ${next}%`;
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
    state.idleMinerUpgrades.push({ speedLevel: 0, radiusLevel: 0, doubleActivationMinLevel: 0, doubleActivationMaxLevel: 0 });
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
    state.coins += getCoinsPerSecond() * secondsAway;

    setStatus(`Welcome back! Earned ${round(getCoinsPerSecond() * secondsAway, 0).toLocaleString()} while away.`);
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

function activateTile(tile: HTMLElement, shouldRender: boolean = true): boolean {
  if (!(tile instanceof HTMLElement) || tile.classList.contains("map-tile--cooldown")) {
    return false;
  }

  const tileType = (tile.dataset.tileType as OreType) || "sand";
  state.coins += getTileCoinValue(tileType);
  
  tile.classList.add("map-tile--cooldown");
  tile.dataset.tileType = "sand";
  clearTileOreClasses(tile);
  
  setTimeout(() => {
    tile.classList.remove("map-tile--cooldown");
    applyTileType(tile, rollTileType());
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
  const cost = getDoubleActivationMaxCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].doubleActivationMaxLevel += 1;
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
    minerNode.innerHTML = `<strong>M${index + 1}</strong>${cooldownLeft.toFixed(1)}s`;
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

  ui.minerPopup.classList.remove("hidden");
  if (ui.minerPopupTitle) ui.minerPopupTitle.textContent = `Miner ${minerIndex + 1}`;
  if (ui.popupSpeedLevel) ui.popupSpeedLevel.textContent = upgrade.speedLevel.toString();
  if (ui.popupRadiusLevel) ui.popupRadiusLevel.textContent = upgrade.radiusLevel.toString();
  if (ui.popupDoubleActivationMinLevel) ui.popupDoubleActivationMinLevel.textContent = upgrade.doubleActivationMinLevel.toString();
  if (ui.popupDoubleActivationMaxLevel) ui.popupDoubleActivationMaxLevel.textContent = upgrade.doubleActivationMaxLevel.toString();
  if (ui.popupSpeedCost) ui.popupSpeedCost.textContent = speedCost.toLocaleString();
  if (ui.popupRadiusCost) ui.popupRadiusCost.textContent = radiusCost.toLocaleString();
  if (ui.popupDoubleActivationMinCost) ui.popupDoubleActivationMinCost.textContent = doubleActivationMinCost.toLocaleString();
  if (ui.popupDoubleActivationMaxCost) ui.popupDoubleActivationMaxCost.textContent = doubleActivationMaxCost.toLocaleString();
  if (ui.popupSpeedStat) ui.popupSpeedStat.textContent = getMinerSpeedStatText(minerIndex);
  if (ui.popupRadiusStat) ui.popupRadiusStat.textContent = getMinerRadiusStatText(minerIndex);
  if (ui.popupDoubleActivationMinStat) ui.popupDoubleActivationMinStat.textContent = getDoubleActivationMinStatText(minerIndex);
  if (ui.popupDoubleActivationMaxStat) ui.popupDoubleActivationMaxStat.textContent = getDoubleActivationMaxStatText(minerIndex);
  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.disabled = !canAfford(speedCost);
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.disabled = !canAfford(radiusCost);
  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.disabled = !canAfford(doubleActivationMinCost);
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.disabled = !canAfford(doubleActivationMaxCost);
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
  if (ui.minerStatsTitle) ui.minerStatsTitle.textContent = `Miner ${minerIndex + 1} Stats`;
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

      const randomIndex = Math.floor(Math.random() * eligibleTiles.length);
      const tile = eligibleTiles[randomIndex];
      if (activateTile(tile, false)) {
        activations += 1;

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
            if (activateTile(bonusTiles[randomBonusIndex], false)) {
              activations += 1;
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
  if (ui.copperGenerationCost) ui.copperGenerationCost.textContent = copperCost.toLocaleString();
  if (ui.copperGenerationLevel) ui.copperGenerationLevel.textContent = state.copperGenerationLevel.toString();
  if (ui.copperGenerationStat) ui.copperGenerationStat.textContent = getOreGenerationStatText("copper");
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.disabled = !canAfford(copperCost);
  if (ui.ironGenerationCost) ui.ironGenerationCost.textContent = ironCost.toLocaleString();
  if (ui.ironGenerationLevel) ui.ironGenerationLevel.textContent = state.ironGenerationLevel.toString();
  if (ui.ironGenerationStat) ui.ironGenerationStat.textContent = getOreGenerationStatText("iron");
  if (ui.buyIronGeneration) ui.buyIronGeneration.disabled = !canAfford(ironCost);
  if (ui.silverGenerationCost) ui.silverGenerationCost.textContent = silverCost.toLocaleString();
  if (ui.silverGenerationLevel) ui.silverGenerationLevel.textContent = state.silverGenerationLevel.toString();
  if (ui.silverGenerationStat) ui.silverGenerationStat.textContent = getOreGenerationStatText("silver");
  if (ui.buySilverGeneration) ui.buySilverGeneration.disabled = !canAfford(silverCost);
  if (ui.goldGenerationCost) ui.goldGenerationCost.textContent = goldCost.toLocaleString();
  if (ui.goldGenerationLevel) ui.goldGenerationLevel.textContent = state.goldGenerationLevel.toString();
  if (ui.goldGenerationStat) ui.goldGenerationStat.textContent = getOreGenerationStatText("gold");
  if (ui.buyGoldGeneration) ui.buyGoldGeneration.disabled = !canAfford(goldCost);

  renderMap();
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

import {
  BASE_MINER_EFFECT_RADIUS_PX,
  MIN_TILE_COVERAGE_IN_RADIUS,
  SAVE_KEY,
  SPECIALIZATION_COST,
} from "./game-constants";
import { createGameActions } from "./game-actions";
import { runIdleMinersLoop } from "./game-loop";
import type {
  GameState,
  MinerTargeting,
  UnitSpecialization,
  UpgradeConfig,
} from "./game-types";
import { clamp } from "./map-geometry";
import { createMinerActions } from "./miner-actions";
import { createMinerLogic } from "./miner-logic";
import { clearSavedGame, loadGameState, saveGameState } from "./persistence";
import { createDefaultResources } from "./resources";
import { createResourceLogic } from "./resource-logic";
import { getChanceText, shouldRevealNextOre } from "./rendering";
import { createTileActions } from "./tile-actions";
import { renderMinerPopupView, renderMinerStatsPanelView } from "./ui-miner-panels";
import { createUiPanelControls } from "./ui-panel-controls";
import { renderResourceStatsPanelView, renderUpgradesAccordionView } from "./ui-renderers";
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

const {
  getOreGenerationLevel,
  setOreGenerationLevel,
  getOreGenerationCost,
  rollTileType,
  rollTileTypeWithBoostedOre,
  getTileCoinValue,
  renderResourceLegend,
  getOreGenerationStatText,
} = createResourceLogic({
  state,
  resourceLegendBody: ui.resourceLegendBody,
  getUpgradeCost,
  round,
  getChanceText,
});

const {
  getMinerUpgrade,
  getMinerClicksPerSecond,
  getMinerCooldownSeconds,
  getMinerSpeedUpgradeCost,
  getMinerRadiusUpgradeCost,
  getMinerEffectRadiusPx,
  getDoubleActivationMinCost,
  getDoubleActivationMaxCost,
  getVeinFinderCost,
  getCritChanceCost,
  getCritMultiplierCost,
  getChainReactionCost,
  getDoubleActivationMinPercent,
  getDoubleActivationMaxPercent,
  rollDoubleActivation,
  getActivationCountFromRoll,
  getMinerSpeedStatText,
  getMinerRadiusStatText,
  getDoubleActivationMinStatText,
  getDoubleActivationMaxStatText,
  getVeinFinderQualityMultiplier,
  getVeinFinderStatText,
  getCritChance,
  getCritMultiplier,
  getChainReactionChance,
  getChainReactionLength,
  getCritChanceStatText,
  getCritMultiplierStatText,
  getChainReactionStatText,
  getMinerDisplayName,
  getMinerRingLabel,
  canOfferClassUnlock,
  canChooseSpecialization,
  canUseClass,
  chooseTargetTile,
  getCoinsPerSecond,
  getMinerPosition,
  getEligibleTilesForMiner,
} = createMinerLogic({
  state,
  getMapSize,
  getUpgradeCost,
  getTileCoinValue,
  getDefaultSpecializationData,
  normalizeSpecialization,
  buildSpecializationData,
  getSpecializationLabel,
  minTileCoverageInRadius: MIN_TILE_COVERAGE_IN_RADIUS,
  baseMinerEffectRadiusPx: BASE_MINER_EFFECT_RADIUS_PX,
  idleMinerTriggerIntervalSeconds: idleMiner.triggerIntervalSeconds || 5,
  fasterMinerBonusClicksPerSecond: fasterMinerUpgrade.bonusClicksPerSecond || 0.1,
  minerRadiusMultiplierPerLevel: minerRadiusUpgrade.radiusMultiplierPerLevel || 1.25,
  fasterMinerUpgrade,
  minerRadiusUpgrade,
  doubleActivationMinUpgrade,
  doubleActivationMaxUpgrade,
  veinFinderUpgrade,
  critChanceUpgrade,
  critMultiplierUpgrade,
  chainReactionUpgrade,
});

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

function setMinerTargeting(mode: MinerTargeting): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }
  state.units[minerIndex].targeting = mode;
  renderMinerPopup();
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

function renderResourceStatsPanel(): void {
  renderResourceStatsPanelView({
    resourceStatsPanel: ui.resourceStatsPanel,
    resourceStatsToggle: ui.resourceStatsToggle,
    isOpen: interactionState.resourceStatsOpen,
  });
}

function renderUpgradesAccordion(): void {
  renderUpgradesAccordionView({
    upgradesAccordionBody: ui.upgradesAccordionBody,
    toggleUpgradesAccordion: ui.toggleUpgradesAccordion,
    isOpen: interactionState.upgradesAccordionOpen,
  });
}

const {
  setSettingsModalOpen,
  setClassModalOpen,
  openMinerPanels,
  toggleResourceStatsPanel,
  closeResourceStatsPanel,
  toggleUpgradesAccordion,
  closeMinerUpgradePanel,
  closeMinerStatsPanel,
  closeMinerPanels,
} = createUiPanelControls({
  ui,
  interactionState,
  renderResourceStatsPanel,
  renderMinerStatsPanel,
  renderMinerPopup,
  renderUpgradesAccordion,
});

const { applyTileType, activateTile, triggerChainReaction } = createTileActions({
  mapGrid: ui.mapGrid,
  addCoins: (amount) => {
    state.coins += amount;
  },
  getTileCoinValue,
  getCritChance,
  getCritMultiplier,
  getVeinFinderQualityMultiplier,
  rollTileType,
  rollTileTypeWithBoostedOre,
  getChainReactionChance,
  getChainReactionLength,
  render,
});

const {
  buyMinerSpeedUpgrade,
  buyMinerRadiusUpgrade,
  toggleMinerRepositionMode,
  buyDoubleActivationMin,
  buyDoubleActivationMax,
  buyVeinFinderUpgrade,
  buyCritChanceUpgrade,
  buyCritMultiplierUpgrade,
  buyChainReactionUpgrade,
} = createMinerActions({
  state,
  interactionState,
  canAfford,
  canUseClass,
  render,
  getMinerSpeedUpgradeCost,
  getMinerRadiusUpgradeCost,
  getMinerCooldownSeconds,
  getDoubleActivationMinCost,
  getDoubleActivationMaxCost,
  getVeinFinderCost,
  getCritChanceCost,
  getCritMultiplierCost,
  getChainReactionCost,
});

const {
  buyIdleMiner,
  resetGame,
  buyMapExpansion,
  buyCoalGeneration,
  buyCopperGeneration,
  buyIronGeneration,
  buySilverGeneration,
  buyGoldGeneration,
} = createGameActions({
  state,
  saveKey: SAVE_KEY,
  clearSavedGame,
  createDefaultResources,
  canAfford,
  getIdleMinerCost,
  getMapExpansionCost,
  getOreGenerationCost,
  getOreGenerationLevel,
  setOreGenerationLevel,
  syncIdleMinerState,
  closeMinerPanels,
  render,
  setSettingsModalOpen,
  setStatus,
});

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

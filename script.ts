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
  OreType,
  UpgradableOre,
  UnitSpecialization,
  UpgradeConfig,
} from "./game-types";
import { clamp } from "./map-geometry";
import { createMinerActions } from "./miner-actions";
import { createMinerLogic } from "./miner-logic";
import { clearSavedGame, loadGameState, saveGameState } from "./persistence";
import { createDefaultResources, createEmptyInventory } from "./resources";
import { createResourceLogic } from "./resource-logic";
import { createRenderScheduler, getChanceText, shouldRevealNextOre } from "./rendering";
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
  oreSapphireRevealed: boolean;
  oreRubyRevealed: boolean;
  oreEmeraldRevealed: boolean;
  oreDiamondRevealed: boolean;
  oreAmethystRevealed: boolean;
  oreGemstoneRevealed: boolean;
}

interface UIElements {
  coins: HTMLElement | null;
  activePlayTime: HTMLElement | null;
  idleMinerCost: HTMLElement | null;
  idleMinerOwned: HTMLElement | null;
  settingsToggle: HTMLElement | null;
  settingsModal: HTMLElement | null;
  inventoryToggle: HTMLButtonElement | null;
  inventoryModal: HTMLElement | null;
  closeInventoryModal: HTMLButtonElement | null;
  inventoryAutoSellToggle: HTMLButtonElement | null;
  inventoryList: HTMLElement | null;
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
  sellAllResources: HTMLButtonElement | null;
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
  popupSpeedLabel: HTMLElement | null;
  popupRadiusLabel: HTMLElement | null;
  popupSpeedCost: HTMLElement | null;
  popupRadiusCost: HTMLElement | null;
  popupSpeedLevel: HTMLElement | null;
  popupRadiusLevel: HTMLElement | null;
  popupUpgradeOvertime: HTMLButtonElement | null;
  popupOvertimeCost: HTMLElement | null;
  popupOvertimeLevel: HTMLElement | null;
  popupOvertimeStat: HTMLElement | null;
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
  gemstoneGenerationCost: HTMLElement | null;
  gemstoneGenerationLevel: HTMLElement | null;
  gemstoneGenerationStat: HTMLElement | null;
  buyGemstoneGeneration: HTMLButtonElement | null;
  sapphireGenerationCost: HTMLElement | null;
  sapphireGenerationLevel: HTMLElement | null;
  sapphireGenerationStat: HTMLElement | null;
  buySapphireGeneration: HTMLButtonElement | null;
  rubyGenerationCost: HTMLElement | null;
  rubyGenerationLevel: HTMLElement | null;
  rubyGenerationStat: HTMLElement | null;
  buyRubyGeneration: HTMLButtonElement | null;
  emeraldGenerationCost: HTMLElement | null;
  emeraldGenerationLevel: HTMLElement | null;
  emeraldGenerationStat: HTMLElement | null;
  buyEmeraldGeneration: HTMLButtonElement | null;
  diamondGenerationCost: HTMLElement | null;
  diamondGenerationLevel: HTMLElement | null;
  diamondGenerationStat: HTMLElement | null;
  buyDiamondGeneration: HTMLButtonElement | null;
  amethystGenerationCost: HTMLElement | null;
  amethystGenerationLevel: HTMLElement | null;
  amethystGenerationStat: HTMLElement | null;
  buyAmethystGeneration: HTMLButtonElement | null;
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
  popupUpgradeMetalBias: HTMLButtonElement | null;
  popupMetalBiasCost: HTMLElement | null;
  popupMetalBiasLevel: HTMLElement | null;
  popupMetalBiasStat: HTMLElement | null;
  popupUpgradeElectricEfficiency: HTMLButtonElement | null;
  popupElectricEfficiencyCost: HTMLElement | null;
  popupElectricEfficiencyLevel: HTMLElement | null;
  popupElectricEfficiencyStat: HTMLElement | null;
  popupUpgradeEnchantBountiful: HTMLButtonElement | null;
  popupEnchantBountifulCost: HTMLElement | null;
  popupEnchantBountifulLevel: HTMLElement | null;
  popupEnchantBountifulStat: HTMLElement | null;
  popupUpgradeEnchantBountifulMin: HTMLButtonElement | null;
  popupEnchantBountifulMinCost: HTMLElement | null;
  popupEnchantBountifulMinLevel: HTMLElement | null;
  popupEnchantBountifulMinStat: HTMLElement | null;
  popupUpgradeEnchantBountifulMax: HTMLButtonElement | null;
  popupEnchantBountifulMaxCost: HTMLElement | null;
  popupEnchantBountifulMaxLevel: HTMLElement | null;
  popupEnchantBountifulMaxStat: HTMLElement | null;
  popupUpgradeEnrichMin: HTMLButtonElement | null;
  popupEnrichMinCost: HTMLElement | null;
  popupEnrichMinLevel: HTMLElement | null;
  popupEnrichMinStat: HTMLElement | null;
  popupUpgradeEnrichMax: HTMLButtonElement | null;
  popupEnrichMaxCost: HTMLElement | null;
  popupEnrichMaxLevel: HTMLElement | null;
  popupEnrichMaxStat: HTMLElement | null;
  popupUpgradeEnrichChance: HTMLButtonElement | null;
  popupEnrichChanceCost: HTMLElement | null;
  popupEnrichChanceLevel: HTMLElement | null;
  popupEnrichChanceStat: HTMLElement | null;
  popupSpecStatus: HTMLElement | null;
  popupUnlockClass: HTMLButtonElement | null;
  popupChooseClass: HTMLButtonElement | null;
  popupTargetingRandom: HTMLButtonElement | null;
  popupTargetingHigh: HTMLButtonElement | null;
  popupTargetingLow: HTMLButtonElement | null;
  classModal: HTMLElement | null;
  classPickForeman: HTMLButtonElement | null;
  classPickVeinFinder: HTMLButtonElement | null;
  classPickCrit: HTMLButtonElement | null;
  classPickChainLightning: HTMLButtonElement | null;
  classPickDoubleActivation: HTMLButtonElement | null;
  classPickArcanist: HTMLButtonElement | null;
  classPickEnricher: HTMLButtonElement | null;
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
  activePlaySeconds: 0,
  autoSellEnabled: false,
  idleMinerOwned: 0,
  mapExpansions: 0,
  resources: [],
  inventory: createEmptyInventory(),
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
  oreSapphireRevealed: false,
  oreRubyRevealed: false,
  oreEmeraldRevealed: false,
  oreDiamondRevealed: false,
  oreAmethystRevealed: false,
  oreGemstoneRevealed: false,
};

let inventoryUiDirty = true;
let lastRenderedCoinValue: number | null = null;
let lastRenderedActivePlayWholeSeconds: number | null = null;

type InventoryOre = OreType;

interface InventoryRowRefs {
  name: HTMLElement;
  amount: HTMLElement;
  value: HTMLElement;
  total: HTMLElement;
  sellButton: HTMLButtonElement;
}

const INVENTORY_ORES: InventoryOre[] = ["sand", "coal", "copper", "iron", "silver", "gold", "amethyst", "sapphire", "emerald", "ruby", "diamond"];
const GEMSTONE_ORES: UpgradableOre[] = ["amethyst", "sapphire", "emerald", "ruby", "diamond"];
const inventoryDirtyOres = new Set<InventoryOre>(INVENTORY_ORES);
const inventoryRowRefs: Partial<Record<InventoryOre, InventoryRowRefs>> = {};

function markInventoryDirty(ore: InventoryOre): void {
  inventoryDirtyOres.add(ore);
  inventoryUiDirty = true;
}

function markAllInventoryDirty(): void {
  for (const ore of INVENTORY_ORES) {
    inventoryDirtyOres.add(ore);
  }
  inventoryUiDirty = true;
}

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
  radiusBonusPerLevel: 0.25,
};

const overtimeUpgrade: UpgradeConfig = {
  baseCost: 300,
  growth: 1.35,
  cappedMax: true,
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
  cappedMax: true,
};

const critMultiplierUpgrade: UpgradeConfig = {
  baseCost: 360,
  growth: 1.35,
};

const chainReactionUpgrade: UpgradeConfig = {
  baseCost: 280,
  growth: 1.45,
};

const metalBiasUpgrade: UpgradeConfig = {
  baseCost: 320,
  growth: 1.4,
  cappedMax: true,
};

const electricEfficiencyUpgrade: UpgradeConfig = {
  baseCost: 360,
  growth: 1.42,
  cappedMax: true,
};

const enchantBountifulUpgrade: UpgradeConfig = {
  baseCost: 300,
  growth: 1.4,
  cappedMax: true,
};

const enchantBountifulMinUpgrade: UpgradeConfig = {
  baseCost: 320,
  growth: 1.34,
};

const enchantBountifulMaxUpgrade: UpgradeConfig = {
  baseCost: 360,
  growth: 1.38,
};

const enrichMinUpgrade: UpgradeConfig = {
  baseCost: 340,
  growth: 1.35,
};

const enrichMaxUpgrade: UpgradeConfig = {
  baseCost: 380,
  growth: 1.4,
};

const enrichChanceUpgrade: UpgradeConfig = {
  baseCost: 320,
  growth: 1.36,
  cappedMax: true,
};

// UI Element references
const ui: UIElements = {
  coins: document.getElementById("coins"),
  activePlayTime: document.getElementById("active-play-time"),
  idleMinerCost: document.getElementById("idle-miner-cost"),
  idleMinerOwned: document.getElementById("idle-miner-owned"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsModal: document.getElementById("settings-modal"),
  inventoryToggle: document.getElementById("inventory-toggle") as HTMLButtonElement,
  inventoryModal: document.getElementById("inventory-modal"),
  closeInventoryModal: document.getElementById("close-inventory-modal") as HTMLButtonElement,
  inventoryAutoSellToggle: document.getElementById("inventory-auto-sell-toggle") as HTMLButtonElement,
  inventoryList: document.getElementById("inventory-list"),
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
  sellAllResources: document.getElementById("sell-all-resources") as HTMLButtonElement,
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
  popupSpeedLabel: document.getElementById("popup-speed-label"),
  popupRadiusLabel: document.getElementById("popup-radius-label"),
  popupSpeedCost: document.getElementById("popup-speed-cost"),
  popupRadiusCost: document.getElementById("popup-radius-cost"),
  popupSpeedLevel: document.getElementById("popup-speed-level"),
  popupRadiusLevel: document.getElementById("popup-radius-level"),
  popupUpgradeOvertime: document.getElementById("popup-upgrade-overtime") as HTMLButtonElement,
  popupOvertimeCost: document.getElementById("popup-overtime-cost"),
  popupOvertimeLevel: document.getElementById("popup-overtime-level"),
  popupOvertimeStat: document.getElementById("popup-overtime-stat"),
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
  gemstoneGenerationCost: document.getElementById("gemstone-generation-cost"),
  gemstoneGenerationLevel: document.getElementById("gemstone-generation-level"),
  gemstoneGenerationStat: document.getElementById("gemstone-generation-stat"),
  buyGemstoneGeneration: document.getElementById("buy-gemstone-generation") as HTMLButtonElement,
  sapphireGenerationCost: document.getElementById("sapphire-generation-cost"),
  sapphireGenerationLevel: document.getElementById("sapphire-generation-level"),
  sapphireGenerationStat: document.getElementById("sapphire-generation-stat"),
  buySapphireGeneration: document.getElementById("buy-sapphire-generation") as HTMLButtonElement,
  rubyGenerationCost: document.getElementById("ruby-generation-cost"),
  rubyGenerationLevel: document.getElementById("ruby-generation-level"),
  rubyGenerationStat: document.getElementById("ruby-generation-stat"),
  buyRubyGeneration: document.getElementById("buy-ruby-generation") as HTMLButtonElement,
  emeraldGenerationCost: document.getElementById("emerald-generation-cost"),
  emeraldGenerationLevel: document.getElementById("emerald-generation-level"),
  emeraldGenerationStat: document.getElementById("emerald-generation-stat"),
  buyEmeraldGeneration: document.getElementById("buy-emerald-generation") as HTMLButtonElement,
  diamondGenerationCost: document.getElementById("diamond-generation-cost"),
  diamondGenerationLevel: document.getElementById("diamond-generation-level"),
  diamondGenerationStat: document.getElementById("diamond-generation-stat"),
  buyDiamondGeneration: document.getElementById("buy-diamond-generation") as HTMLButtonElement,
  amethystGenerationCost: document.getElementById("amethyst-generation-cost"),
  amethystGenerationLevel: document.getElementById("amethyst-generation-level"),
  amethystGenerationStat: document.getElementById("amethyst-generation-stat"),
  buyAmethystGeneration: document.getElementById("buy-amethyst-generation") as HTMLButtonElement,
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
  popupUpgradeMetalBias: document.getElementById("popup-upgrade-metal-bias") as HTMLButtonElement,
  popupMetalBiasCost: document.getElementById("popup-metal-bias-cost"),
  popupMetalBiasLevel: document.getElementById("popup-metal-bias-level"),
  popupMetalBiasStat: document.getElementById("popup-metal-bias-stat"),
  popupUpgradeElectricEfficiency: document.getElementById("popup-upgrade-electric-efficiency") as HTMLButtonElement,
  popupElectricEfficiencyCost: document.getElementById("popup-electric-efficiency-cost"),
  popupElectricEfficiencyLevel: document.getElementById("popup-electric-efficiency-level"),
  popupElectricEfficiencyStat: document.getElementById("popup-electric-efficiency-stat"),
  popupUpgradeEnchantBountiful: document.getElementById("popup-upgrade-enchant-bountiful") as HTMLButtonElement,
  popupEnchantBountifulCost: document.getElementById("popup-enchant-bountiful-cost"),
  popupEnchantBountifulLevel: document.getElementById("popup-enchant-bountiful-level"),
  popupEnchantBountifulStat: document.getElementById("popup-enchant-bountiful-stat"),
  popupUpgradeEnchantBountifulMin: document.getElementById("popup-upgrade-enchant-bountiful-min") as HTMLButtonElement,
  popupEnchantBountifulMinCost: document.getElementById("popup-enchant-bountiful-min-cost"),
  popupEnchantBountifulMinLevel: document.getElementById("popup-enchant-bountiful-min-level"),
  popupEnchantBountifulMinStat: document.getElementById("popup-enchant-bountiful-min-stat"),
  popupUpgradeEnchantBountifulMax: document.getElementById("popup-upgrade-enchant-bountiful-max") as HTMLButtonElement,
  popupEnchantBountifulMaxCost: document.getElementById("popup-enchant-bountiful-max-cost"),
  popupEnchantBountifulMaxLevel: document.getElementById("popup-enchant-bountiful-max-level"),
  popupEnchantBountifulMaxStat: document.getElementById("popup-enchant-bountiful-max-stat"),
  popupUpgradeEnrichMin: document.getElementById("popup-upgrade-enrich-min") as HTMLButtonElement,
  popupEnrichMinCost: document.getElementById("popup-enrich-min-cost"),
  popupEnrichMinLevel: document.getElementById("popup-enrich-min-level"),
  popupEnrichMinStat: document.getElementById("popup-enrich-min-stat"),
  popupUpgradeEnrichMax: document.getElementById("popup-upgrade-enrich-max") as HTMLButtonElement,
  popupEnrichMaxCost: document.getElementById("popup-enrich-max-cost"),
  popupEnrichMaxLevel: document.getElementById("popup-enrich-max-level"),
  popupEnrichMaxStat: document.getElementById("popup-enrich-max-stat"),
  popupUpgradeEnrichChance: document.getElementById("popup-upgrade-enrich-chance") as HTMLButtonElement,
  popupEnrichChanceCost: document.getElementById("popup-enrich-chance-cost"),
  popupEnrichChanceLevel: document.getElementById("popup-enrich-chance-level"),
  popupEnrichChanceStat: document.getElementById("popup-enrich-chance-stat"),
  popupSpecStatus: document.getElementById("popup-spec-status"),
  popupUnlockClass: document.getElementById("popup-unlock-class") as HTMLButtonElement,
  popupChooseClass: document.getElementById("popup-choose-class") as HTMLButtonElement,
  popupTargetingRandom: document.getElementById("popup-targeting-random") as HTMLButtonElement,
  popupTargetingHigh: document.getElementById("popup-targeting-high") as HTMLButtonElement,
  popupTargetingLow: document.getElementById("popup-targeting-low") as HTMLButtonElement,
  classModal: document.getElementById("class-modal"),
  classPickForeman: document.getElementById("class-pick-foreman") as HTMLButtonElement,
  classPickVeinFinder: document.getElementById("class-pick-vein-finder") as HTMLButtonElement,
  classPickCrit: document.getElementById("class-pick-crit") as HTMLButtonElement,
  classPickChainLightning: document.getElementById("class-pick-chain-lightning") as HTMLButtonElement,
  classPickDoubleActivation: document.getElementById("class-pick-double-activation") as HTMLButtonElement,
  classPickArcanist: document.getElementById("class-pick-arcanist") as HTMLButtonElement,
  classPickEnricher: document.getElementById("class-pick-enricher") as HTMLButtonElement,
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

function canOfferUpgrade(config: UpgradeConfig, canUpgrade: boolean): boolean {
  return config.cappedMax ? canUpgrade : true;
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

function getGemstoneGenerationLevel(): number {
  return Math.max(...GEMSTONE_ORES.map((ore) => getOreGenerationLevel(ore)));
}

function syncGemstoneGenerationLevels(): void {
  const sharedLevel = getGemstoneGenerationLevel();
  for (const ore of GEMSTONE_ORES) {
    if (getOreGenerationLevel(ore) !== sharedLevel) {
      setOreGenerationLevel(ore, sharedLevel);
    }
  }
}

function getGemstoneGenerationCost(): number {
  return getOreGenerationCost(GEMSTONE_ORES[0]);
}

function canIncreaseGemstoneGeneration(): boolean {
  return GEMSTONE_ORES.every((ore) => canIncreaseOreGeneration(ore));
}

function getGemstoneGenerationStatText(): string {
  const currentLevel = getGemstoneGenerationLevel();
  const currentWeight = GEMSTONE_ORES.reduce((sum, ore) => sum + getOreWeightForLevel(ore, currentLevel), 0);
  const nextWeight = GEMSTONE_ORES.reduce((sum, ore) => sum + getOreWeightForLevel(ore, currentLevel + 1), 0);

  if (currentLevel <= 0) {
    return `Locked. Weight: 0 → ${round(nextWeight, 2).toLocaleString()} on first upgrade`;
  }

  return `Weight: ${round(currentWeight, 2).toLocaleString()} → ${round(nextWeight, 2).toLocaleString()} (+20%)`;
}

function buyGemstoneGenerationUpgrade(): void {
  if (!canIncreaseGemstoneGeneration()) {
    return;
  }

  const cost = getGemstoneGenerationCost();
  if (!canAfford(cost)) {
    return;
  }

  const nextLevel = getGemstoneGenerationLevel() + 1;
  state.coins -= cost;
  for (const ore of GEMSTONE_ORES) {
    setOreGenerationLevel(ore, nextLevel);
  }

  render();
}

const {
  getOreGenerationLevel,
  setOreGenerationLevel,
  getOreWeightForLevel,
  getOreGenerationCost,
  canIncreaseOreGeneration,
  rollTileType,
  rollTileTypeWithBoostedOre,
  getTileCoinValue,
  getInventoryAmount,
  addInventory,
  sellInventory,
  sellAllInventory,
  flushInventory,
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
  getOvertimeCost,
  canUpgradeOvertime,
  getMinerEffectRadiusPx,
  getDoubleActivationMinCost,
  getDoubleActivationMaxCost,
  getVeinFinderCost,
  getCritChanceCost,
  canUpgradeCritChance,
  getCritMultiplierCost,
  getChainReactionCost,
  getMetalBiasCost,
  getElectricEfficiencyCost,
  canUpgradeMetalBias,
  canUpgradeElectricEfficiency,
  getEnchantBountifulCost,
  canUpgradeEnchantBountifulChance,
  getEnchantBountifulMinCost,
  getEnchantBountifulMaxCost,
  getEnrichMinCost,
  getEnrichMaxCost,
  getEnrichChanceCost,
  canUpgradeEnrichChance,
  getDoubleActivationMinPercent,
  getDoubleActivationMaxPercent,
  rollDoubleActivation,
  getActivationCountFromRoll,
  getMinerSpeedStatText,
  getMinerRadiusStatText,
  getOvertimeStatText,
  getDoubleActivationMinStatText,
  getDoubleActivationMaxStatText,
  getVeinFinderQualityMultiplier,
  getVeinFinderStatText,
  getCritChance,
  getCritMultiplier,
  getChainReactionChance,
  getChainReactionLength,
  getChainMetalBiasChance,
  getElectricEfficiencyChance,
  getEnchantBountifulChance,
  getEnchantBountifulMinMultiplier,
  getEnchantBountifulMaxMultiplier,
  getEnrichChance,
  getEnrichMinMultiplier,
  getEnrichMaxMultiplier,
  getCritChanceStatText,
  getCritMultiplierStatText,
  getChainReactionStatText,
  getMetalBiasStatText,
  getElectricEfficiencyStatText,
  getEnchantBountifulStatText,
  getEnchantBountifulMinStatText,
  getEnchantBountifulMaxStatText,
  getEnrichMinStatText,
  getEnrichMaxStatText,
  getEnrichChanceStatText,
  getMinerDisplayName,
  getMinerRingLabel,
  canOfferClassUnlock,
  canChooseSpecialization,
  canUseClass,
  isArcanistMiner,
  isEnricherMiner,
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
  minerRadiusBonusPerLevel: minerRadiusUpgrade.radiusBonusPerLevel || 0.25,
  fasterMinerUpgrade,
  minerRadiusUpgrade,
  overtimeUpgrade,
  doubleActivationMinUpgrade,
  doubleActivationMaxUpgrade,
  veinFinderUpgrade,
  critChanceUpgrade,
  critMultiplierUpgrade,
  chainReactionUpgrade,
  metalBiasUpgrade,
  electricEfficiencyUpgrade,
  enchantBountifulUpgrade,
  enchantBountifulMinUpgrade,
  enchantBountifulMaxUpgrade,
  enrichMinUpgrade,
  enrichMaxUpgrade,
  enrichChanceUpgrade,
});

const requestRender = createRenderScheduler(() => renderNow());

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
  setClassModalOpen(true);
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

function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safeSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
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

function setInventoryModalOpen(isOpen: boolean): void {
  if (!ui.inventoryModal || !ui.inventoryToggle) return;
  ui.inventoryModal.classList.toggle("hidden", !isOpen);
  ui.inventoryModal.setAttribute("aria-hidden", String(!isOpen));
  ui.inventoryToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    markAllInventoryDirty();
    renderInventoryModal();
  }
}

function renderInventoryAutoSellToggle(): void {
  if (!ui.inventoryAutoSellToggle) {
    return;
  }

  ui.inventoryAutoSellToggle.textContent = state.autoSellEnabled ? "Auto Sell: On" : "Auto Sell: Off";
  ui.inventoryAutoSellToggle.setAttribute("aria-pressed", String(state.autoSellEnabled));
}

function toggleInventoryAutoSell(): void {
  state.autoSellEnabled = !state.autoSellEnabled;
  renderInventoryAutoSellToggle();
  setStatus(state.autoSellEnabled ? "Auto Sell enabled." : "Auto Sell disabled.");
}

function renderInventoryModal(): void {
  if (!ui.inventoryList) {
    return;
  }

  if (!inventoryRowRefs.sand) {
    ui.inventoryList.innerHTML = "";

    for (const ore of INVENTORY_ORES) {
      const row = document.createElement("p");
      row.className = "inventory-row";

      const nameNode = document.createElement("span");
      const amountNode = document.createElement("span");
      const valueNode = document.createElement("span");
      const totalNode = document.createElement("span");
      const actionNode = document.createElement("span");
      const sellButton = document.createElement("button");

      sellButton.type = "button";
      sellButton.className = "inventory-sell-all-btn";
      sellButton.dataset.ore = ore;
      sellButton.textContent = "Sell All";

      actionNode.appendChild(sellButton);
      row.append(nameNode, amountNode, valueNode, totalNode, actionNode);
      ui.inventoryList.appendChild(row);

      inventoryRowRefs[ore] = {
        name: nameNode,
        amount: amountNode,
        value: valueNode,
        total: totalNode,
        sellButton,
      };
    }
    markAllInventoryDirty();
  }

  for (const ore of INVENTORY_ORES) {
    if (!inventoryDirtyOres.has(ore)) {
      continue;
    }
    const refs = inventoryRowRefs[ore];
    if (!refs) {
      continue;
    }

    const resource = state.resources.find((entry) => entry.ore === ore);
    const name = resource?.name || ore;
    const value = getTileCoinValue(ore);
    const amount = getInventoryAmount(ore);
    const total = value * amount;

    refs.name.textContent = name;
    refs.amount.textContent = amount.toLocaleString();
    refs.value.textContent = value.toLocaleString();
    refs.total.textContent = total.toLocaleString();
  }

  inventoryDirtyOres.clear();
  inventoryUiDirty = false;
}

function sellOneResource(ore: OreType): void {
  const soldCoins = sellInventory(ore, 1);
  if (soldCoins <= 0) {
    setStatus(`No ${ore} available to sell.`);
    return;
  }
  state.coins += soldCoins;
  markInventoryDirty(ore);
  setStatus(`Sold 1 ${ore} for ${soldCoins.toLocaleString()} coins.`);
  render();
}

function sellAllForResource(ore: OreType): void {
  const soldCoins = sellInventory(ore, getInventoryAmount(ore));
  if (soldCoins <= 0) {
    setStatus(`No ${ore} available to sell.`);
    return;
  }
  state.coins += soldCoins;
  markInventoryDirty(ore);
  setStatus(`Sold all ${ore} for ${soldCoins.toLocaleString()} coins.`);
  render();
}

function sellAllResourcesAction(): void {
  const soldCoins = sellAllInventory();
  if (soldCoins <= 0) {
    return;
  }
  state.coins += soldCoins;
  markAllInventoryDirty();
  setStatus(`Sold inventory for ${soldCoins.toLocaleString()} coins.`);
  render();
}

function canAfford(cost: number): boolean {
  return state.coins >= cost;
}

function saveGame(showStatus: boolean = true): void {
  flushInventory();
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
  syncGemstoneGenerationLevels();
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
  addInventory: (ore, amount) => {
    addInventory(ore, amount);
    if (state.autoSellEnabled) {
      const soldCoins = sellInventory(ore, amount);
      if (soldCoins > 0) {
        state.coins += soldCoins;
      }
    }
    markInventoryDirty(ore);
  },
  getTileCoinValue,
  isArcanistMiner,
  isEnricherMiner,
  getCritChance,
  getCritMultiplier,
  getVeinFinderQualityMultiplier,
  rollTileType,
  rollTileTypeWithBoostedOre,
  getChainReactionChance,
  getChainReactionLength,
  getChainMetalBiasChance,
  getElectricEfficiencyChance,
  getEnchantBountifulChance,
  getEnchantBountifulMinMultiplier,
  getEnchantBountifulMaxMultiplier,
  getEnrichChance,
  getEnrichMinMultiplier,
  getEnrichMaxMultiplier,
  render,
});

const {
  buyMinerSpeedUpgrade,
  buyMinerRadiusUpgrade,
  buyOvertimeUpgrade,
  toggleMinerRepositionMode,
  buyDoubleActivationMin,
  buyDoubleActivationMax,
  buyVeinFinderUpgrade,
  buyCritChanceUpgrade,
  buyCritMultiplierUpgrade,
  buyChainReactionUpgrade,
  buyMetalBiasUpgrade,
  buyElectricEfficiencyUpgrade,
  buyEnchantBountifulUpgrade,
  buyEnchantBountifulMinUpgrade,
  buyEnchantBountifulMaxUpgrade,
  buyEnrichMinUpgrade,
  buyEnrichMaxUpgrade,
  buyEnrichChanceUpgrade,
} = createMinerActions({
  state,
  interactionState,
  canAfford,
  canUseClass,
  render,
  getMinerSpeedUpgradeCost,
  getMinerRadiusUpgradeCost,
  getOvertimeCost,
  canUpgradeOvertime,
  getMinerCooldownSeconds,
  getDoubleActivationMinCost,
  getDoubleActivationMaxCost,
  getVeinFinderCost,
  getCritChanceCost,
  canUpgradeCritChance,
  getCritMultiplierCost,
  getChainReactionCost,
  getMetalBiasCost,
  getElectricEfficiencyCost,
  canUpgradeMetalBias,
  canUpgradeElectricEfficiency,
  getEnchantBountifulCost,
  canUpgradeEnchantBountifulChance,
  getEnchantBountifulMinCost,
  getEnchantBountifulMaxCost,
  getEnrichMinCost,
  getEnrichMaxCost,
  getEnrichChanceCost,
  canUpgradeEnrichChance,
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
  buySapphireGeneration,
  buyRubyGeneration,
  buyEmeraldGeneration,
  buyDiamondGeneration,
  buyAmethystGeneration,
} = createGameActions({
  state,
  saveKey: SAVE_KEY,
  clearSavedGame,
  createDefaultResources,
  createEmptyInventory,
  canAfford,
  getIdleMinerCost,
  getMapExpansionCost,
  getOreGenerationCost,
  canIncreaseOreGeneration,
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
    tile.dataset.tileEnchantment = "none";

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
    minerNode.innerHTML = `<strong>${getMinerRingLabel(index)}</strong>`;
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
      overtimeLevel: 0,
      doubleActivationMinLevel: 0,
      doubleActivationMaxLevel: 0,
      veinFinderLevel: 0,
      critChanceLevel: 0,
      critMultiplierLevel: 0,
      chainReactionLevel: 0,
      metalBiasLevel: 0,
      electricEfficiencyLevel: 0,
      enchantBountifulLevel: 0,
      enchantBountifulMinLevel: 0,
      enchantBountifulMaxLevel: 0,
      enrichMinLevel: 0,
      enrichMaxLevel: 0,
      enrichChanceLevel: 0,
      speedCost: 0,
      radiusCost: 0,
      overtimeCost: 0,
      doubleActivationMinCost: 0,
      doubleActivationMaxCost: 0,
      veinFinderCost: 0,
      critChanceCost: 0,
      critMultiplierCost: 0,
      chainReactionCost: 0,
      metalBiasCost: 0,
      electricEfficiencyCost: 0,
      enchantBountifulCost: 0,
      enchantBountifulMinCost: 0,
      enchantBountifulMaxCost: 0,
      enrichMinCost: 0,
      enrichMaxCost: 0,
      enrichChanceCost: 0,
      speedStat: "",
      radiusStat: "",
      overtimeStat: "",
      doubleActivationMinStat: "",
      doubleActivationMaxStat: "",
      veinFinderStat: "",
      critChanceStat: "",
      critMultiplierStat: "",
      chainReactionStat: "",
      metalBiasStat: "",
      electricEfficiencyStat: "",
      enchantBountifulStat: "",
      enchantBountifulMinStat: "",
      enchantBountifulMaxStat: "",
      enrichMinStat: "",
      enrichMaxStat: "",
      enrichChanceStat: "",
      specStatus: "",
      canUnlockClass: false,
      specAffordable: false,
      canChooseClass: false,
      targeting: "random",
      showDoubleActivation: false,
      showVeinFinder: false,
      showCrit: false,
      showCritChance: false,
      showChainLightning: false,
      showMetalBias: false,
      showElectricEfficiency: false,
      showArcanist: false,
      showEnchantBountiful: false,
      showEnricher: false,
      showEnrichChance: false,
      showForeman: false,
      canBuySpeed: false,
      canBuyRadius: false,
      canBuyOvertime: false,
      canBuyDoubleActivationMin: false,
      canBuyDoubleActivationMax: false,
      canBuyVeinFinder: false,
      canBuyCritChance: false,
      canBuyCritMultiplier: false,
      canBuyChainReaction: false,
      canBuyMetalBias: false,
      canBuyElectricEfficiency: false,
      canBuyEnchantBountiful: false,
      canBuyEnchantBountifulMin: false,
      canBuyEnchantBountifulMax: false,
      canBuyEnrichMin: false,
      canBuyEnrichMax: false,
      canBuyEnrichChance: false,
      placementMode: interactionState.placementMode,
    });
    return;
  }

  const upgrade = getMinerUpgrade(minerIndex);
  const speedCost = getMinerSpeedUpgradeCost(minerIndex);
  const radiusCost = getMinerRadiusUpgradeCost(minerIndex);
  const overtimeCost = getOvertimeCost(minerIndex);
  const doubleActivationMinCost = getDoubleActivationMinCost(minerIndex);
  const doubleActivationMaxCost = getDoubleActivationMaxCost(minerIndex);
  const veinFinderCost = getVeinFinderCost(minerIndex);
  const critChanceCost = getCritChanceCost(minerIndex);
  const critMultiplierCost = getCritMultiplierCost(minerIndex);
  const chainReactionCost = getChainReactionCost(minerIndex);
  const metalBiasCost = getMetalBiasCost(minerIndex);
  const electricEfficiencyCost = getElectricEfficiencyCost(minerIndex);
  const enchantBountifulCost = getEnchantBountifulCost(minerIndex);
  const enchantBountifulMinCost = getEnchantBountifulMinCost(minerIndex);
  const enchantBountifulMaxCost = getEnchantBountifulMaxCost(minerIndex);
  const enrichMinCost = getEnrichMinCost(minerIndex);
  const enrichMaxCost = getEnrichMaxCost(minerIndex);
  const enrichChanceCost = getEnrichChanceCost(minerIndex);
  const canUnlockClass = canOfferClassUnlock(minerIndex);
  const canSpec = canChooseSpecialization(minerIndex);
  const selectedSpec = upgrade.specialization;
  const specAffordable = canAfford(SPECIALIZATION_COST);
  const showDoubleActivation = selectedSpec === "Multi Activator";
  const showVeinFinder = selectedSpec === "Prospector";
  const showCrit = selectedSpec === "Crit Build";
  const showCritChance = showCrit && canOfferUpgrade(critChanceUpgrade, canUpgradeCritChance(minerIndex));
  const showChainLightning = selectedSpec === "Chain Lightning";
  const showMetalBias = showChainLightning && canOfferUpgrade(metalBiasUpgrade, canUpgradeMetalBias(minerIndex));
  const showElectricEfficiency =
    showChainLightning && canOfferUpgrade(electricEfficiencyUpgrade, canUpgradeElectricEfficiency(minerIndex));
  const showArcanist = selectedSpec === "Arcanist";
  const showEnchantBountiful =
    showArcanist && canOfferUpgrade(enchantBountifulUpgrade, canUpgradeEnchantBountifulChance(minerIndex));
  const showEnricher = selectedSpec === "Enricher";
  const showEnrichChance = showEnricher && canOfferUpgrade(enrichChanceUpgrade, canUpgradeEnrichChance(minerIndex));
  const showForeman = selectedSpec === "Foreman" && canOfferUpgrade(overtimeUpgrade, canUpgradeOvertime(minerIndex));
  const multiData = upgrade.specializationData.type === "Multi Activator" ? upgrade.specializationData : null;
  const prospectorData = upgrade.specializationData.type === "Prospector" ? upgrade.specializationData : null;
  const critData = upgrade.specializationData.type === "Crit Build" ? upgrade.specializationData : null;
  const chainData = upgrade.specializationData.type === "Chain Lightning" ? upgrade.specializationData : null;
  const foremanData = upgrade.specializationData.type === "Foreman" ? upgrade.specializationData : null;
  const arcanistData = upgrade.specializationData.type === "Arcanist" ? upgrade.specializationData : null;
  const enricherData = upgrade.specializationData.type === "Enricher" ? upgrade.specializationData : null;

  if (ui.popupSpeedLabel) {
    ui.popupSpeedLabel.textContent = selectedSpec === "Foreman" ? "Motivation" : "Faster Miner";
  }
  if (ui.popupRadiusLabel) {
    ui.popupRadiusLabel.textContent = selectedSpec === "Foreman" ? "Autonomy" : "Wider Mining Radius";
  }

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
    overtimeLevel: foremanData?.overtimeLevel ?? 0,
    doubleActivationMinLevel: multiData?.multiActivationMinLevel ?? 0,
    doubleActivationMaxLevel: multiData?.multiActivationMaxLevel ?? 0,
    veinFinderLevel: prospectorData?.veinFinderLevel ?? 0,
    critChanceLevel: critData?.critChanceLevel ?? 0,
    critMultiplierLevel: critData?.critMultiplierLevel ?? 0,
    chainReactionLevel: chainData?.chainReactionLevel ?? 0,
    metalBiasLevel: chainData?.metalBiasLevel ?? 0,
    electricEfficiencyLevel: chainData?.electricEfficiencyLevel ?? 0,
    enchantBountifulLevel: arcanistData?.enchantBountifulLevel ?? 0,
    enchantBountifulMinLevel: arcanistData?.enchantBountifulMinLevel ?? 0,
    enchantBountifulMaxLevel: arcanistData?.enchantBountifulMaxLevel ?? 0,
    enrichMinLevel: enricherData?.enrichMinLevel ?? 0,
    enrichMaxLevel: enricherData?.enrichMaxLevel ?? 0,
    enrichChanceLevel: enricherData?.enrichChanceLevel ?? 0,
    speedCost,
    radiusCost,
    overtimeCost,
    doubleActivationMinCost,
    doubleActivationMaxCost,
    veinFinderCost,
    critChanceCost,
    critMultiplierCost,
    chainReactionCost,
    metalBiasCost,
    electricEfficiencyCost,
    enchantBountifulCost,
    enchantBountifulMinCost,
    enchantBountifulMaxCost,
    enrichMinCost,
    enrichMaxCost,
    enrichChanceCost,
    speedStat: getMinerSpeedStatText(minerIndex),
    radiusStat: getMinerRadiusStatText(minerIndex),
    overtimeStat: getOvertimeStatText(minerIndex),
    doubleActivationMinStat: getDoubleActivationMinStatText(minerIndex),
    doubleActivationMaxStat: getDoubleActivationMaxStatText(minerIndex),
    veinFinderStat: getVeinFinderStatText(minerIndex),
    critChanceStat: getCritChanceStatText(minerIndex),
    critMultiplierStat: getCritMultiplierStatText(minerIndex),
    chainReactionStat: getChainReactionStatText(minerIndex),
    metalBiasStat: getMetalBiasStatText(minerIndex),
    electricEfficiencyStat: getElectricEfficiencyStatText(minerIndex),
    enchantBountifulStat: getEnchantBountifulStatText(minerIndex),
    enchantBountifulMinStat: getEnchantBountifulMinStatText(minerIndex),
    enchantBountifulMaxStat: getEnchantBountifulMaxStatText(minerIndex),
    enrichMinStat: getEnrichMinStatText(minerIndex),
    enrichMaxStat: getEnrichMaxStatText(minerIndex),
    enrichChanceStat: getEnrichChanceStatText(minerIndex),
    specStatus,
    canUnlockClass,
    specAffordable,
    canChooseClass: canSpec,
    targeting: upgrade.targeting,
    showDoubleActivation,
    showVeinFinder,
    showCrit,
    showCritChance,
    showChainLightning,
    showMetalBias,
    showElectricEfficiency,
    showArcanist,
    showEnchantBountiful,
    showEnricher,
    showEnrichChance,
    showForeman,
    canBuySpeed: canAfford(speedCost),
    canBuyRadius: canAfford(radiusCost),
    canBuyOvertime: canAfford(overtimeCost) && canUpgradeOvertime(minerIndex),
    canBuyDoubleActivationMin: canAfford(doubleActivationMinCost) && canUseClass(minerIndex, "Multi Activator"),
    canBuyDoubleActivationMax: canAfford(doubleActivationMaxCost) && canUseClass(minerIndex, "Multi Activator"),
    canBuyVeinFinder: canAfford(veinFinderCost) && canUseClass(minerIndex, "Prospector"),
    canBuyCritChance: canAfford(critChanceCost) && canUpgradeCritChance(minerIndex),
    canBuyCritMultiplier: canAfford(critMultiplierCost) && canUseClass(minerIndex, "Crit Build"),
    canBuyChainReaction: canAfford(chainReactionCost) && canUseClass(minerIndex, "Chain Lightning"),
    canBuyMetalBias: canAfford(metalBiasCost) && canUpgradeMetalBias(minerIndex),
    canBuyElectricEfficiency: canAfford(electricEfficiencyCost) && canUpgradeElectricEfficiency(minerIndex),
    canBuyEnchantBountiful: canAfford(enchantBountifulCost) && canUpgradeEnchantBountifulChance(minerIndex),
    canBuyEnchantBountifulMin: canAfford(enchantBountifulMinCost) && canUseClass(minerIndex, "Arcanist"),
    canBuyEnchantBountifulMax: canAfford(enchantBountifulMaxCost) && canUseClass(minerIndex, "Arcanist"),
    canBuyEnrichMin: canAfford(enrichMinCost) && canUseClass(minerIndex, "Enricher"),
    canBuyEnrichMax: canAfford(enrichMaxCost) && canUseClass(minerIndex, "Enricher"),
    canBuyEnrichChance: canAfford(enrichChanceCost) && canUpgradeEnrichChance(minerIndex),
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

function renderNow(): void {
  if (flushInventory()) {
    markAllInventoryDirty();
  }

  syncIdleMinerState();
  syncGemstoneGenerationLevels();

  const idleMinerCost = getIdleMinerCost();
  const mapCost = getMapExpansionCost();
  const coalCost = getOreGenerationCost("coal");
  const copperCost = getOreGenerationCost("copper");
  const ironCost = getOreGenerationCost("iron");
  const silverCost = getOreGenerationCost("silver");
  const goldCost = getOreGenerationCost("gold");
  const gemstoneCost = getGemstoneGenerationCost();
  const canUpgradeCoalGeneration = canIncreaseOreGeneration("coal");
  const canUpgradeCopperGeneration = canIncreaseOreGeneration("copper");
  const canUpgradeIronGeneration = canIncreaseOreGeneration("iron");
  const canUpgradeSilverGeneration = canIncreaseOreGeneration("silver");
  const canUpgradeGoldGeneration = canIncreaseOreGeneration("gold");
  const canUpgradeGemstoneGeneration = canIncreaseGemstoneGeneration();
  const totalInventory =
    getInventoryAmount("sand") +
    getInventoryAmount("coal") +
    getInventoryAmount("copper") +
    getInventoryAmount("iron") +
    getInventoryAmount("silver") +
    getInventoryAmount("gold") +
    getInventoryAmount("sapphire") +
    getInventoryAmount("ruby") +
    getInventoryAmount("emerald") +
    getInventoryAmount("diamond") +
    getInventoryAmount("amethyst");
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
  if (!interactionState.oreGemstoneRevealed && shouldRevealNextOre(getOreGenerationLevel("gold"), state.coins, gemstoneCost)) {
    interactionState.oreGemstoneRevealed = true;
  }

  if (ui.coins && lastRenderedCoinValue !== state.coins) {
    ui.coins.textContent = format(state.coins);
    lastRenderedCoinValue = state.coins;
  }
  const activePlayWholeSeconds = Math.floor(state.activePlaySeconds);
  if (ui.activePlayTime && lastRenderedActivePlayWholeSeconds !== activePlayWholeSeconds) {
    ui.activePlayTime.textContent = formatDuration(activePlayWholeSeconds);
    lastRenderedActivePlayWholeSeconds = activePlayWholeSeconds;
  }
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
  if (ui.buyCoalGeneration) {
    ui.buyCoalGeneration.classList.toggle("hidden", !canUpgradeCoalGeneration);
    ui.buyCoalGeneration.disabled = !canAfford(coalCost) || !canUpgradeCoalGeneration;
  }
  if (ui.buyCopperGeneration) {
    ui.buyCopperGeneration.classList.toggle(
      "hidden",
      (!interactionState.oreCopperRevealed && getOreGenerationLevel("copper") === 0) || !canUpgradeCopperGeneration
    );
  }
  if (ui.copperGenerationCost) ui.copperGenerationCost.textContent = copperCost.toLocaleString();
  if (ui.copperGenerationLevel) ui.copperGenerationLevel.textContent = getOreGenerationLevel("copper").toString();
  if (ui.copperGenerationStat) ui.copperGenerationStat.textContent = getOreGenerationStatText("copper");
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.disabled = !canAfford(copperCost) || !canUpgradeCopperGeneration;
  if (ui.buyIronGeneration) {
    ui.buyIronGeneration.classList.toggle("hidden", (!interactionState.oreIronRevealed && getOreGenerationLevel("iron") === 0) || !canUpgradeIronGeneration);
  }
  if (ui.ironGenerationCost) ui.ironGenerationCost.textContent = ironCost.toLocaleString();
  if (ui.ironGenerationLevel) ui.ironGenerationLevel.textContent = getOreGenerationLevel("iron").toString();
  if (ui.ironGenerationStat) ui.ironGenerationStat.textContent = getOreGenerationStatText("iron");
  if (ui.buyIronGeneration) ui.buyIronGeneration.disabled = !canAfford(ironCost) || !canUpgradeIronGeneration;
  if (ui.buySilverGeneration) {
    ui.buySilverGeneration.classList.toggle(
      "hidden",
      (!interactionState.oreSilverRevealed && getOreGenerationLevel("silver") === 0) || !canUpgradeSilverGeneration
    );
  }
  if (ui.silverGenerationCost) ui.silverGenerationCost.textContent = silverCost.toLocaleString();
  if (ui.silverGenerationLevel) ui.silverGenerationLevel.textContent = getOreGenerationLevel("silver").toString();
  if (ui.silverGenerationStat) ui.silverGenerationStat.textContent = getOreGenerationStatText("silver");
  if (ui.buySilverGeneration) ui.buySilverGeneration.disabled = !canAfford(silverCost) || !canUpgradeSilverGeneration;
  if (ui.buyGoldGeneration) {
    ui.buyGoldGeneration.classList.toggle("hidden", (!interactionState.oreGoldRevealed && getOreGenerationLevel("gold") === 0) || !canUpgradeGoldGeneration);
  }
  if (ui.goldGenerationCost) ui.goldGenerationCost.textContent = goldCost.toLocaleString();
  if (ui.goldGenerationLevel) ui.goldGenerationLevel.textContent = getOreGenerationLevel("gold").toString();
  if (ui.goldGenerationStat) ui.goldGenerationStat.textContent = getOreGenerationStatText("gold");
  if (ui.buyGoldGeneration) ui.buyGoldGeneration.disabled = !canAfford(goldCost) || !canUpgradeGoldGeneration;
  if (ui.buyGemstoneGeneration) {
    ui.buyGemstoneGeneration.classList.toggle("hidden", (!interactionState.oreGemstoneRevealed && getGemstoneGenerationLevel() === 0) || !canUpgradeGemstoneGeneration);
    ui.buyGemstoneGeneration.disabled = !canAfford(gemstoneCost) || !canUpgradeGemstoneGeneration;
  }
  if (ui.gemstoneGenerationCost) ui.gemstoneGenerationCost.textContent = gemstoneCost.toLocaleString();
  if (ui.gemstoneGenerationLevel) ui.gemstoneGenerationLevel.textContent = getGemstoneGenerationLevel().toString();
  if (ui.gemstoneGenerationStat) ui.gemstoneGenerationStat.textContent = getGemstoneGenerationStatText();
  if (ui.sellAllResources) ui.sellAllResources.disabled = totalInventory <= 0;
  renderInventoryAutoSellToggle();

  renderMap();
  renderUpgradesAccordion();
  renderResourceStatsPanel();
  renderResourceLegend();
  const isInventoryModalOpen = !!ui.inventoryModal && !ui.inventoryModal.classList.contains("hidden");
  if (isInventoryModalOpen && (inventoryUiDirty || inventoryDirtyOres.size > 0)) {
    renderInventoryModal();
  }
  renderMinerRing();
  renderMinerStatsPanel();
  renderMinerPopup();
}

function render(): void {
  requestRender();
}

function gameLoop(): void {
  const now = Date.now();
  const deltaSeconds = (now - state.lastTick) / 1000;
  state.lastTick = now;

  const isActiveSession = document.visibilityState === "visible" && document.hasFocus();
  if (isActiveSession && Number.isFinite(deltaSeconds) && deltaSeconds > 0) {
    state.activePlaySeconds += Math.min(deltaSeconds, 1);
  }

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
  setInventoryModalOpen,
  toggleInventoryAutoSell,
  activateTile: (tile) => {
    activateTile(tile);
  },
  openMinerPanels,
  moveMinerToPointer,
  render,
  buyMinerSpeedUpgrade,
  buyMinerRadiusUpgrade,
  buyOvertimeUpgrade,
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
  buyGemstoneGeneration: buyGemstoneGenerationUpgrade,
  buySapphireGeneration,
  buyRubyGeneration,
  buyEmeraldGeneration,
  buyDiamondGeneration,
  buyAmethystGeneration,
  sellOneResource,
  sellAllByResource: sellAllForResource,
  sellAllResources: sellAllResourcesAction,
  buyDoubleActivationMin,
  buyDoubleActivationMax,
  buyVeinFinderUpgrade,
  buyCritChanceUpgrade,
  buyCritMultiplierUpgrade,
  buyChainReactionUpgrade,
  buyMetalBiasUpgrade,
  buyElectricEfficiencyUpgrade,
  buyEnchantBountifulUpgrade,
  buyEnchantBountifulMinUpgrade,
  buyEnchantBountifulMaxUpgrade,
  buyEnrichMinUpgrade,
  buyEnrichMaxUpgrade,
  buyEnrichChanceUpgrade,
  unlockClassChoice,
  selectMinerSpecialization,
  setMinerTargeting,
  saveGame,
  resetGame,
});

loadGame();
state.lastTick = Date.now();
renderNow();

setInterval(gameLoop, 100);
setInterval(() => saveGame(false), 10000);

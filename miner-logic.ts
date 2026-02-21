import {
  getDefaultMinerPosition,
  getTileBoundsByIndex,
  getTileCoverageInMinerRadius,
} from "./map-geometry";
import type {
  GameState,
  MinerTargeting,
  OreType,
  Position,
  Unit,
  UnitSpecialization,
  UpgradeConfig,
} from "./game-types";
import type { buildSpecializationData, normalizeSpecialization, getSpecializationLabel, getDefaultSpecializationData } from "./unit-specialization";

interface CreateMinerLogicArgs {
  state: GameState;
  getMapSize: () => number;
  getUpgradeCost: (config: UpgradeConfig, owned: number) => number;
  getTileCoinValue: (tileType: OreType) => number;
  getDefaultSpecializationData: typeof getDefaultSpecializationData;
  normalizeSpecialization: typeof normalizeSpecialization;
  buildSpecializationData: typeof buildSpecializationData;
  getSpecializationLabel: typeof getSpecializationLabel;
  minTileCoverageInRadius: number;
  baseMinerEffectRadiusPx: number;
  idleMinerTriggerIntervalSeconds: number;
  fasterMinerBonusClicksPerSecond: number;
  minerRadiusBonusPerLevel: number;
  fasterMinerUpgrade: UpgradeConfig;
  minerRadiusUpgrade: UpgradeConfig;
  doubleActivationMinUpgrade: UpgradeConfig;
  doubleActivationMaxUpgrade: UpgradeConfig;
  veinFinderUpgrade: UpgradeConfig;
  critChanceUpgrade: UpgradeConfig;
  critMultiplierUpgrade: UpgradeConfig;
  chainReactionUpgrade: UpgradeConfig;
  metalBiasUpgrade: UpgradeConfig;
  electricEfficiencyUpgrade: UpgradeConfig;
  enchantBountifulUpgrade: UpgradeConfig;
  enchantBountifulMinUpgrade: UpgradeConfig;
  enchantBountifulMaxUpgrade: UpgradeConfig;
  enrichMinUpgrade: UpgradeConfig;
  enrichMaxUpgrade: UpgradeConfig;
  enrichChanceUpgrade: UpgradeConfig;
}

export function createMinerLogic(args: CreateMinerLogicArgs): {
  getMinerUpgrade: (minerIndex: number) => Unit;
  getMinerClicksPerSecond: (minerIndex: number) => number;
  getMinerCooldownSeconds: (minerIndex: number) => number;
  getMinerSpeedUpgradeCost: (minerIndex: number) => number;
  getMinerRadiusUpgradeCost: (minerIndex: number) => number;
  getMinerEffectRadiusPx: (minerIndex: number) => number;
  getDoubleActivationMinCost: (minerIndex: number) => number;
  getDoubleActivationMaxCost: (minerIndex: number) => number;
  getVeinFinderCost: (minerIndex: number) => number;
  getCritChanceCost: (minerIndex: number) => number;
  getCritMultiplierCost: (minerIndex: number) => number;
  canUpgradeCritChance: (minerIndex: number) => boolean;
  getChainReactionCost: (minerIndex: number) => number;
  getMetalBiasCost: (minerIndex: number) => number;
  getElectricEfficiencyCost: (minerIndex: number) => number;
  canUpgradeMetalBias: (minerIndex: number) => boolean;
  canUpgradeElectricEfficiency: (minerIndex: number) => boolean;
  getEnchantBountifulCost: (minerIndex: number) => number;
  canUpgradeEnchantBountifulChance: (minerIndex: number) => boolean;
  getEnchantBountifulMinCost: (minerIndex: number) => number;
  getEnchantBountifulMaxCost: (minerIndex: number) => number;
  getEnrichMinCost: (minerIndex: number) => number;
  getEnrichMaxCost: (minerIndex: number) => number;
  getEnrichChanceCost: (minerIndex: number) => number;
  canUpgradeEnrichChance: (minerIndex: number) => boolean;
  getDoubleActivationMinPercent: (minerIndex: number) => number;
  getDoubleActivationMaxPercent: (minerIndex: number) => number;
  rollDoubleActivation: (minerIndex: number) => number;
  getActivationCountFromRoll: (roll: number) => number;
  getMinerSpeedStatText: (minerIndex: number) => string;
  getMinerRadiusStatText: (minerIndex: number) => string;
  getDoubleActivationMinStatText: (minerIndex: number) => string;
  getDoubleActivationMaxStatText: (minerIndex: number) => string;
  getVeinFinderQualityMultiplier: (minerIndex: number) => number;
  getVeinFinderStatText: (minerIndex: number) => string;
  getCritChance: (minerIndex: number) => number;
  getCritMultiplier: (minerIndex: number) => number;
  getChainReactionChance: (minerIndex: number) => number;
  getChainReactionLength: (minerIndex: number) => number;
  getChainMetalBiasChance: (minerIndex: number) => number;
  getElectricEfficiencyChance: (minerIndex: number) => number;
  getEnchantBountifulChance: (minerIndex: number) => number;
  getEnchantBountifulMinMultiplier: (minerIndex: number) => number;
  getEnchantBountifulMaxMultiplier: (minerIndex: number) => number;
  getEnrichMinMultiplier: (minerIndex: number) => number;
  getEnrichMaxMultiplier: (minerIndex: number) => number;
  getEnrichChance: (minerIndex: number) => number;
  getCritChanceStatText: (minerIndex: number) => string;
  getCritMultiplierStatText: (minerIndex: number) => string;
  getChainReactionStatText: (minerIndex: number) => string;
  getMetalBiasStatText: (minerIndex: number) => string;
  getElectricEfficiencyStatText: (minerIndex: number) => string;
  getEnchantBountifulStatText: (minerIndex: number) => string;
  getEnchantBountifulMinStatText: (minerIndex: number) => string;
  getEnchantBountifulMaxStatText: (minerIndex: number) => string;
  getEnrichMinStatText: (minerIndex: number) => string;
  getEnrichMaxStatText: (minerIndex: number) => string;
  getEnrichChanceStatText: (minerIndex: number) => string;
  getMinerDisplayName: (minerIndex: number) => string;
  getMinerRingLabel: (minerIndex: number) => string;
  canOfferClassUnlock: (minerIndex: number) => boolean;
  canChooseSpecialization: (minerIndex: number) => boolean;
  canUseClass: (minerIndex: number, spec: UnitSpecialization) => boolean;
  isArcanistMiner: (minerIndex: number) => boolean;
  isEnricherMiner: (minerIndex: number) => boolean;
  chooseTargetTile: (minerIndex: number, eligibleTiles: HTMLElement[]) => HTMLElement;
  getCoinsPerSecond: () => number;
  getMinerPosition: (minerIndex: number) => Position;
  getEligibleTilesForMiner: (minerIndex: number, availableTiles: HTMLElement[], mapSize: number) => HTMLElement[];
} {
  const {
    state,
    getMapSize,
    getUpgradeCost,
    getTileCoinValue,
    getDefaultSpecializationData,
    normalizeSpecialization,
    buildSpecializationData,
    getSpecializationLabel,
    minTileCoverageInRadius,
    baseMinerEffectRadiusPx,
    idleMinerTriggerIntervalSeconds,
    fasterMinerBonusClicksPerSecond,
    minerRadiusBonusPerLevel,
    fasterMinerUpgrade,
    minerRadiusUpgrade,
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
  } = args;

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
    return 1 / idleMinerTriggerIntervalSeconds + upgrade.speedLevel * fasterMinerBonusClicksPerSecond;
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
    return baseMinerEffectRadiusPx * (1 + upgrade.radiusLevel * minerRadiusBonusPerLevel);
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

  function canUpgradeCritChance(minerIndex: number): boolean {
    if (!canUseClass(minerIndex, "Crit Build")) {
      return false;
    }
    return getCritChance(minerIndex) < 0.75;
  }

  function getChainReactionCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Chain Lightning" ? unit.specializationData.chainReactionLevel : 0;
    return getUpgradeCost(chainReactionUpgrade, level);
  }

  function getMetalBiasCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Chain Lightning" ? unit.specializationData.metalBiasLevel : 0;
    return getUpgradeCost(metalBiasUpgrade, level);
  }

  function getElectricEfficiencyCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Chain Lightning" ? unit.specializationData.electricEfficiencyLevel : 0;
    return getUpgradeCost(electricEfficiencyUpgrade, level);
  }

  function canUpgradeMetalBias(minerIndex: number): boolean {
    if (!canUseClass(minerIndex, "Chain Lightning")) {
      return false;
    }
    return getChainMetalBiasChance(minerIndex) < 0.75;
  }

  function canUpgradeElectricEfficiency(minerIndex: number): boolean {
    if (!canUseClass(minerIndex, "Chain Lightning")) {
      return false;
    }
    return getElectricEfficiencyChance(minerIndex) < 0.5;
  }

  function getEnchantBountifulCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Arcanist" ? unit.specializationData.enchantBountifulLevel : 0;
    return getUpgradeCost(enchantBountifulUpgrade, level);
  }

  function canUpgradeEnchantBountifulChance(minerIndex: number): boolean {
    if (!canUseClass(minerIndex, "Arcanist")) {
      return false;
    }
    return getEnchantBountifulChance(minerIndex) < 0.75;
  }

  function getEnchantBountifulMinCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Arcanist" ? unit.specializationData.enchantBountifulMinLevel : 0;
    return getUpgradeCost(enchantBountifulMinUpgrade, level);
  }

  function getEnchantBountifulMaxCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Arcanist" ? unit.specializationData.enchantBountifulMaxLevel : 0;
    return getUpgradeCost(enchantBountifulMaxUpgrade, level);
  }

  function getEnrichMinCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Enricher" ? unit.specializationData.enrichMinLevel : 0;
    return getUpgradeCost(enrichMinUpgrade, level);
  }

  function getEnrichMaxCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Enricher" ? unit.specializationData.enrichMaxLevel : 0;
    return getUpgradeCost(enrichMaxUpgrade, level);
  }

  function getEnrichChanceCost(minerIndex: number): number {
    const unit = getMinerUpgrade(minerIndex);
    const level = unit.specializationData.type === "Enricher" ? unit.specializationData.enrichChanceLevel : 0;
    return getUpgradeCost(enrichChanceUpgrade, level);
  }

  function canUpgradeEnrichChance(minerIndex: number): boolean {
    if (!canUseClass(minerIndex, "Enricher")) {
      return false;
    }
    return getEnrichChance(minerIndex) < 0.75;
  }

  function canUseClass(minerIndex: number, spec: UnitSpecialization): boolean {
    const selected = getMinerUpgrade(minerIndex).specialization;
    return selected === spec;
  }

  function isArcanistMiner(minerIndex: number): boolean {
    return canUseClass(minerIndex, "Arcanist");
  }

  function isEnricherMiner(minerIndex: number): boolean {
    return canUseClass(minerIndex, "Enricher");
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

    if (minPercent > maxPercent) {
      return maxPercent;
    }

    return minPercent + Math.random() * (maxPercent - minPercent);
  }

  function getActivationCountFromRoll(roll: number): number {
    const fullActivations = Math.floor(roll);
    const remainder = roll - fullActivations;
    const extraChance = Math.random() < remainder ? 1 : 0;
    return fullActivations + extraChance;
  }

  function getMinerSpeedStatText(minerIndex: number): string {
    const upgrade = getMinerUpgrade(minerIndex);
    const current = (1 / idleMinerTriggerIntervalSeconds + upgrade.speedLevel * fasterMinerBonusClicksPerSecond).toFixed(2);
    const next = (1 / idleMinerTriggerIntervalSeconds + (upgrade.speedLevel + 1) * fasterMinerBonusClicksPerSecond).toFixed(2);
    return `Current: ${current} act/sec → Upgrading to: ${next} act/sec`;
  }

  function getMinerRadiusStatText(minerIndex: number): string {
    const upgrade = getMinerUpgrade(minerIndex);
    const currentRadius = Math.round(getMinerEffectRadiusPx(minerIndex));
    const nextRadius = Math.round(baseMinerEffectRadiusPx * (1 + (upgrade.radiusLevel + 1) * minerRadiusBonusPerLevel));
    return `Current: ${currentRadius}px radius → Upgrading to: ${nextRadius}px radius`;
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
    const nextBoost = (1.25 + (level + 1) * 0.25 - 1) * 100;
    return `Current boost: +${currentBoost.toFixed(0)}% → Upgrading to: +${nextBoost.toFixed(0)}% for mined ore respawn weight`;
  }

  function getCritChance(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Crit Build")) {
      return 0;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Crit Build" ? data.critChanceLevel : 0;
    return Math.min(0.75, 0.1 + level * 0.03);
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

  function getChainMetalBiasChance(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Chain Lightning")) {
      return 0;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Chain Lightning" ? data.metalBiasLevel : 0;
    return Math.min(0.75, level * 0.05);
  }

  function getElectricEfficiencyChance(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Chain Lightning")) {
      return 0;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Chain Lightning" ? data.electricEfficiencyLevel : 0;
    return Math.min(0.5, level * 0.05);
  }

  function getEnchantBountifulChance(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Arcanist")) {
      return 0;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Arcanist" ? data.enchantBountifulLevel : 0;
    return Math.min(0.75, 0.15 + level * 0.1);
  }

  function getEnchantBountifulMinMultiplier(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Arcanist")) {
      return 1;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Arcanist" ? data.enchantBountifulMinLevel : 0;
    return 2 + level * 0.2;
  }

  function getEnchantBountifulMaxMultiplier(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Arcanist")) {
      return 1;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Arcanist" ? data.enchantBountifulMaxLevel : 0;
    return 2 + level * 0.3;
  }

  function getEnrichMinMultiplier(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Enricher")) {
      return 1;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Enricher" ? data.enrichMinLevel : 0;
    return 1.5 + level * 0.15;
  }

  function getEnrichMaxMultiplier(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Enricher")) {
      return 1;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Enricher" ? data.enrichMaxLevel : 0;
    return 2 + level * 0.25;
  }

  function getEnrichChance(minerIndex: number): number {
    if (!canUseClass(minerIndex, "Enricher")) {
      return 0;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Enricher" ? data.enrichChanceLevel : 0;
    return Math.min(0.75, 0.2 + level * 0.08);
  }

  function getCritChanceStatText(minerIndex: number): string {
    const current = (getCritChance(minerIndex) * 100).toFixed(0);
    if (!canUpgradeCritChance(minerIndex)) {
      return `Current chance: ${current}% (Max reached)`;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Crit Build" ? data.critChanceLevel : 0;
    const next = (Math.min(0.75, 0.1 + (level + 1) * 0.03) * 100).toFixed(0);
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

  function getMetalBiasStatText(minerIndex: number): string {
    const current = (getChainMetalBiasChance(minerIndex) * 100).toFixed(0);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Chain Lightning" ? data.metalBiasLevel : 0;
    const next = (Math.min(0.75, (level + 1) * 0.05) * 100).toFixed(0);
    return `Current metal bias: ${current}% → Upgrading to: ${next}%`;
  }

  function getElectricEfficiencyStatText(minerIndex: number): string {
    const current = (getElectricEfficiencyChance(minerIndex) * 100).toFixed(0);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Chain Lightning" ? data.electricEfficiencyLevel : 0;
    const next = (Math.min(0.5, (level + 1) * 0.05) * 100).toFixed(0);
    return `Current extension chance: ${current}% → Upgrading to: ${next}% on metal chain`;
  }

  function getEnchantBountifulStatText(minerIndex: number): string {
    const current = (getEnchantBountifulChance(minerIndex) * 100).toFixed(0);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Arcanist" ? data.enchantBountifulLevel : 0;
    const next = (Math.min(0.75, 0.15 + (level + 1) * 0.1) * 100).toFixed(0);
    return `Current chance: ${current}% → Upgrading to: ${next}% to apply Bountiful enchantment`;
  }

  function getEnchantBountifulMinStatText(minerIndex: number): string {
    const current = getEnchantBountifulMinMultiplier(minerIndex).toFixed(2);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Arcanist" ? data.enchantBountifulMinLevel : 0;
    const next = (2 + (level + 1) * 0.2).toFixed(2);
    return `Current min: ${current}x → Upgrading to: ${next}x`;
  }

  function getEnchantBountifulMaxStatText(minerIndex: number): string {
    const current = getEnchantBountifulMaxMultiplier(minerIndex).toFixed(2);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Arcanist" ? data.enchantBountifulMaxLevel : 0;
    const next = (2 + (level + 1) * 0.3).toFixed(2);
    return `Current max: ${current}x → Upgrading to: ${next}x`;
  }

  function getEnrichMinStatText(minerIndex: number): string {
    const current = getEnrichMinMultiplier(minerIndex).toFixed(2);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Enricher" ? data.enrichMinLevel : 0;
    const next = (1.5 + (level + 1) * 0.15).toFixed(2);
    return `Current min: ${current}x → Upgrading to: ${next}x`;
  }

  function getEnrichMaxStatText(minerIndex: number): string {
    const current = getEnrichMaxMultiplier(minerIndex).toFixed(2);
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Enricher" ? data.enrichMaxLevel : 0;
    const next = (2 + (level + 1) * 0.25).toFixed(2);
    return `Current max: ${current}x → Upgrading to: ${next}x`;
  }

  function getEnrichChanceStatText(minerIndex: number): string {
    const current = (getEnrichChance(minerIndex) * 100).toFixed(0);
    if (!canUpgradeEnrichChance(minerIndex)) {
      return `Current chance: ${current}% (Max reached)`;
    }
    const data = getMinerUpgrade(minerIndex).specializationData;
    const level = data.type === "Enricher" ? data.enrichChanceLevel : 0;
    const next = (Math.min(0.75, 0.2 + (level + 1) * 0.08) * 100).toFixed(0);
    return `Current chance: ${current}% → Upgrading to: ${next}%`;
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
    if (upgrade.specialization === "Arcanist") {
      return `✨${minerIndex + 1}`;
    }
    if (upgrade.specialization === "Enricher") {
      return `💜${minerIndex + 1}`;
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

  function chooseTargetTile(minerIndex: number, eligibleTiles: HTMLElement[]): HTMLElement {
    const specialization = getMinerUpgrade(minerIndex).specialization;
    const targetPool = specialization === "Arcanist" || specialization === "Enricher"
      ? (() => {
          const resourceTiles = eligibleTiles.filter((tile) => {
            const tileType = (tile.dataset.tileType as OreType) || "sand";
            return tileType !== "sand";
          });

          const unenchantedResourceTiles = resourceTiles.filter((tile) => {
            const enchantment = tile.dataset.tileEnchantment;
            return !enchantment || enchantment === "none";
          });

          if (unenchantedResourceTiles.length > 0) {
            return unenchantedResourceTiles;
          }

          if (resourceTiles.length > 0) {
            return resourceTiles;
          }

          const unenchantedTiles = eligibleTiles.filter((tile) => {
            const enchantment = tile.dataset.tileEnchantment;
            return !enchantment || enchantment === "none";
          });

          return unenchantedTiles.length > 0 ? unenchantedTiles : eligibleTiles;
        })()
      : eligibleTiles;

    const targeting = getMinerUpgrade(minerIndex).targeting;
    if (targeting === "random") {
      return targetPool[Math.floor(Math.random() * targetPool.length)];
    }

    let targetValue = targeting === "high-quality" ? -Infinity : Infinity;
    const bestTiles: HTMLElement[] = [];

    for (const tile of targetPool) {
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

    return bestTiles[Math.floor(Math.random() * bestTiles.length)] || targetPool[0];
  }

  function getCoinsPerSecond(): number {
    let total = 0;
    for (let minerIndex = 0; minerIndex < state.idleMinerOwned; minerIndex += 1) {
      total += getMinerClicksPerSecond(minerIndex);
    }
    return total;
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
      return coverage >= minTileCoverageInRadius;
    });
  }

  return {
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
    canUpgradeCritChance,
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
    getEnrichMinMultiplier,
    getEnrichMaxMultiplier,
    getEnrichChance,
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
  };
}

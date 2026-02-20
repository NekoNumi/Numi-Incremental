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
  minerRadiusMultiplierPerLevel: number;
  fasterMinerUpgrade: UpgradeConfig;
  minerRadiusUpgrade: UpgradeConfig;
  doubleActivationMinUpgrade: UpgradeConfig;
  doubleActivationMaxUpgrade: UpgradeConfig;
  veinFinderUpgrade: UpgradeConfig;
  critChanceUpgrade: UpgradeConfig;
  critMultiplierUpgrade: UpgradeConfig;
  chainReactionUpgrade: UpgradeConfig;
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
  getChainReactionCost: (minerIndex: number) => number;
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
  getCritChanceStatText: (minerIndex: number) => string;
  getCritMultiplierStatText: (minerIndex: number) => string;
  getChainReactionStatText: (minerIndex: number) => string;
  getMinerDisplayName: (minerIndex: number) => string;
  getMinerRingLabel: (minerIndex: number) => string;
  canOfferClassUnlock: (minerIndex: number) => boolean;
  canChooseSpecialization: (minerIndex: number) => boolean;
  canUseClass: (minerIndex: number, spec: UnitSpecialization) => boolean;
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
    minerRadiusMultiplierPerLevel,
    fasterMinerUpgrade,
    minerRadiusUpgrade,
    doubleActivationMinUpgrade,
    doubleActivationMaxUpgrade,
    veinFinderUpgrade,
    critChanceUpgrade,
    critMultiplierUpgrade,
    chainReactionUpgrade,
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
    return baseMinerEffectRadiusPx * minerRadiusMultiplierPerLevel ** upgrade.radiusLevel;
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

  function canUseClass(minerIndex: number, spec: UnitSpecialization): boolean {
    const selected = getMinerUpgrade(minerIndex).specialization;
    return selected === spec;
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
    const nextRadius = upgrade.radiusLevel + 1;
    const currentMultiplier = (minerRadiusMultiplierPerLevel ** upgrade.radiusLevel).toFixed(2);
    const nextMultiplier = (minerRadiusMultiplierPerLevel ** nextRadius).toFixed(2);
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
  };
}

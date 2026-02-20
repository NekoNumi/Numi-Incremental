import type { MinerTargeting } from "./game-types";

interface MinerPopupUi {
  minerPopup: HTMLElement | null;
  minerPopupTitle: HTMLElement | null;
  popupSpeedLevel: HTMLElement | null;
  popupRadiusLevel: HTMLElement | null;
  popupDoubleActivationMinLevel: HTMLElement | null;
  popupDoubleActivationMaxLevel: HTMLElement | null;
  popupVeinFinderLevel: HTMLElement | null;
  popupCritChanceLevel: HTMLElement | null;
  popupCritMultiplierLevel: HTMLElement | null;
  popupChainReactionLevel: HTMLElement | null;
  popupSpeedCost: HTMLElement | null;
  popupRadiusCost: HTMLElement | null;
  popupDoubleActivationMinCost: HTMLElement | null;
  popupDoubleActivationMaxCost: HTMLElement | null;
  popupVeinFinderCost: HTMLElement | null;
  popupCritChanceCost: HTMLElement | null;
  popupCritMultiplierCost: HTMLElement | null;
  popupChainReactionCost: HTMLElement | null;
  popupSpeedStat: HTMLElement | null;
  popupRadiusStat: HTMLElement | null;
  popupDoubleActivationMinStat: HTMLElement | null;
  popupDoubleActivationMaxStat: HTMLElement | null;
  popupVeinFinderStat: HTMLElement | null;
  popupCritChanceStat: HTMLElement | null;
  popupCritMultiplierStat: HTMLElement | null;
  popupChainReactionStat: HTMLElement | null;
  popupSpecStatus: HTMLElement | null;
  popupUnlockClass: HTMLButtonElement | null;
  popupChooseClass: HTMLButtonElement | null;
  popupTargetingRandom: HTMLButtonElement | null;
  popupTargetingHigh: HTMLButtonElement | null;
  popupTargetingLow: HTMLButtonElement | null;
  popupUpgradeDoubleActivationMin: HTMLButtonElement | null;
  popupUpgradeDoubleActivationMax: HTMLButtonElement | null;
  popupUpgradeVeinFinder: HTMLButtonElement | null;
  popupUpgradeCritChance: HTMLButtonElement | null;
  popupUpgradeCritMultiplier: HTMLButtonElement | null;
  popupUpgradeChainReaction: HTMLButtonElement | null;
  popupUpgradeSpeed: HTMLButtonElement | null;
  popupUpgradeRadius: HTMLButtonElement | null;
  popupReposition: HTMLButtonElement | null;
}

interface MinerPopupViewModel {
  isVisible: boolean;
  title: string;
  speedLevel: number;
  radiusLevel: number;
  doubleActivationMinLevel: number;
  doubleActivationMaxLevel: number;
  veinFinderLevel: number;
  critChanceLevel: number;
  critMultiplierLevel: number;
  chainReactionLevel: number;
  speedCost: number;
  radiusCost: number;
  doubleActivationMinCost: number;
  doubleActivationMaxCost: number;
  veinFinderCost: number;
  critChanceCost: number;
  critMultiplierCost: number;
  chainReactionCost: number;
  speedStat: string;
  radiusStat: string;
  doubleActivationMinStat: string;
  doubleActivationMaxStat: string;
  veinFinderStat: string;
  critChanceStat: string;
  critMultiplierStat: string;
  chainReactionStat: string;
  specStatus: string;
  canUnlockClass: boolean;
  specAffordable: boolean;
  canChooseClass: boolean;
  targeting: MinerTargeting;
  showDoubleActivation: boolean;
  showVeinFinder: boolean;
  showCrit: boolean;
  showChainLightning: boolean;
  canBuySpeed: boolean;
  canBuyRadius: boolean;
  canBuyDoubleActivationMin: boolean;
  canBuyDoubleActivationMax: boolean;
  canBuyVeinFinder: boolean;
  canBuyCritChance: boolean;
  canBuyCritMultiplier: boolean;
  canBuyChainReaction: boolean;
  placementMode: boolean;
}

interface MinerStatsUi {
  minerStatsPanel: HTMLElement | null;
  minerStatsTitle: HTMLElement | null;
  statsMinerPosition: HTMLElement | null;
  statsMinerRate: HTMLElement | null;
  statsMinerCooldown: HTMLElement | null;
  statsMinerRadius: HTMLElement | null;
  statsMinerSpeedLevel: HTMLElement | null;
  statsMinerRadiusLevel: HTMLElement | null;
  statsDoubleActivationRange: HTMLElement | null;
}

interface MinerStatsViewModel {
  isVisible: boolean;
  title: string;
  positionText: string;
  rateText: string;
  cooldownText: string;
  radiusText: string;
  speedLevel: number;
  radiusLevel: number;
  doubleActivationRangeText: string;
}

export function renderMinerPopupView(ui: MinerPopupUi, view: MinerPopupViewModel): void {
  if (!ui.minerPopup) {
    return;
  }

  if (!view.isVisible) {
    ui.minerPopup.classList.add("hidden");
    return;
  }

  ui.minerPopup.classList.remove("hidden");
  if (ui.minerPopupTitle) ui.minerPopupTitle.textContent = view.title;
  if (ui.popupSpeedLevel) ui.popupSpeedLevel.textContent = view.speedLevel.toString();
  if (ui.popupRadiusLevel) ui.popupRadiusLevel.textContent = view.radiusLevel.toString();
  if (ui.popupDoubleActivationMinLevel) ui.popupDoubleActivationMinLevel.textContent = view.doubleActivationMinLevel.toString();
  if (ui.popupDoubleActivationMaxLevel) ui.popupDoubleActivationMaxLevel.textContent = view.doubleActivationMaxLevel.toString();
  if (ui.popupVeinFinderLevel) ui.popupVeinFinderLevel.textContent = view.veinFinderLevel.toString();
  if (ui.popupCritChanceLevel) ui.popupCritChanceLevel.textContent = view.critChanceLevel.toString();
  if (ui.popupCritMultiplierLevel) ui.popupCritMultiplierLevel.textContent = view.critMultiplierLevel.toString();
  if (ui.popupChainReactionLevel) ui.popupChainReactionLevel.textContent = view.chainReactionLevel.toString();
  if (ui.popupSpeedCost) ui.popupSpeedCost.textContent = view.speedCost.toLocaleString();
  if (ui.popupRadiusCost) ui.popupRadiusCost.textContent = view.radiusCost.toLocaleString();
  if (ui.popupDoubleActivationMinCost) ui.popupDoubleActivationMinCost.textContent = view.doubleActivationMinCost.toLocaleString();
  if (ui.popupDoubleActivationMaxCost) ui.popupDoubleActivationMaxCost.textContent = view.doubleActivationMaxCost.toLocaleString();
  if (ui.popupVeinFinderCost) ui.popupVeinFinderCost.textContent = view.veinFinderCost.toLocaleString();
  if (ui.popupCritChanceCost) ui.popupCritChanceCost.textContent = view.critChanceCost.toLocaleString();
  if (ui.popupCritMultiplierCost) ui.popupCritMultiplierCost.textContent = view.critMultiplierCost.toLocaleString();
  if (ui.popupChainReactionCost) ui.popupChainReactionCost.textContent = view.chainReactionCost.toLocaleString();
  if (ui.popupSpeedStat) ui.popupSpeedStat.textContent = view.speedStat;
  if (ui.popupRadiusStat) ui.popupRadiusStat.textContent = view.radiusStat;
  if (ui.popupDoubleActivationMinStat) ui.popupDoubleActivationMinStat.textContent = view.doubleActivationMinStat;
  if (ui.popupDoubleActivationMaxStat) ui.popupDoubleActivationMaxStat.textContent = view.doubleActivationMaxStat;
  if (ui.popupVeinFinderStat) ui.popupVeinFinderStat.textContent = view.veinFinderStat;
  if (ui.popupCritChanceStat) ui.popupCritChanceStat.textContent = view.critChanceStat;
  if (ui.popupCritMultiplierStat) ui.popupCritMultiplierStat.textContent = view.critMultiplierStat;
  if (ui.popupChainReactionStat) ui.popupChainReactionStat.textContent = view.chainReactionStat;
  if (ui.popupSpecStatus) ui.popupSpecStatus.textContent = view.specStatus;

  if (ui.popupUnlockClass) {
    ui.popupUnlockClass.classList.toggle("hidden", !view.canUnlockClass);
    ui.popupUnlockClass.disabled = !view.canUnlockClass || !view.specAffordable;
  }
  if (ui.popupChooseClass) {
    ui.popupChooseClass.classList.toggle("hidden", !view.canChooseClass);
    ui.popupChooseClass.disabled = !view.canChooseClass;
  }

  if (ui.popupTargetingRandom) {
    ui.popupTargetingRandom.disabled = view.targeting === "random";
  }
  if (ui.popupTargetingHigh) {
    ui.popupTargetingHigh.disabled = view.targeting === "high-quality";
  }
  if (ui.popupTargetingLow) {
    ui.popupTargetingLow.disabled = view.targeting === "low-quality";
  }

  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.classList.toggle("hidden", !view.showDoubleActivation);
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.classList.toggle("hidden", !view.showDoubleActivation);
  if (ui.popupUpgradeVeinFinder) ui.popupUpgradeVeinFinder.classList.toggle("hidden", !view.showVeinFinder);
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.classList.toggle("hidden", !view.showCrit);
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.classList.toggle("hidden", !view.showCrit);
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.classList.toggle("hidden", !view.showChainLightning);

  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.disabled = !view.canBuySpeed;
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.disabled = !view.canBuyRadius;
  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.disabled = !view.canBuyDoubleActivationMin;
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.disabled = !view.canBuyDoubleActivationMax;
  if (ui.popupUpgradeVeinFinder) ui.popupUpgradeVeinFinder.disabled = !view.canBuyVeinFinder;
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.disabled = !view.canBuyCritChance;
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.disabled = !view.canBuyCritMultiplier;
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.disabled = !view.canBuyChainReaction;
  if (ui.popupReposition) ui.popupReposition.textContent = view.placementMode ? "Click map to place…" : "Reposition";
}

export function renderMinerStatsPanelView(ui: MinerStatsUi, view: MinerStatsViewModel): void {
  if (!ui.minerStatsPanel) {
    return;
  }

  if (!view.isVisible) {
    ui.minerStatsPanel.classList.add("hidden");
    return;
  }

  ui.minerStatsPanel.classList.remove("hidden");
  if (ui.minerStatsTitle) ui.minerStatsTitle.textContent = view.title;
  if (ui.statsMinerPosition) ui.statsMinerPosition.textContent = view.positionText;
  if (ui.statsMinerRate) ui.statsMinerRate.textContent = view.rateText;
  if (ui.statsMinerCooldown) ui.statsMinerCooldown.textContent = view.cooldownText;
  if (ui.statsMinerRadius) ui.statsMinerRadius.textContent = view.radiusText;
  if (ui.statsMinerSpeedLevel) ui.statsMinerSpeedLevel.textContent = view.speedLevel.toString();
  if (ui.statsMinerRadiusLevel) ui.statsMinerRadiusLevel.textContent = view.radiusLevel.toString();
  if (ui.statsDoubleActivationRange) ui.statsDoubleActivationRange.textContent = view.doubleActivationRangeText;
}

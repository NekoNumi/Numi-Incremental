import type { MinerTargeting } from "./game-types";

interface MinerPopupUi {
  minerPopup: HTMLElement | null;
  minerPopupTitle: HTMLElement | null;
  popupSpeedLevel: HTMLElement | null;
  popupRadiusLevel: HTMLElement | null;
  popupOvertimeLevel: HTMLElement | null;
  popupDoubleActivationMinLevel: HTMLElement | null;
  popupDoubleActivationMaxLevel: HTMLElement | null;
  popupVeinFinderLevel: HTMLElement | null;
  popupCritChanceLevel: HTMLElement | null;
  popupCritMultiplierLevel: HTMLElement | null;
  popupChainReactionLevel: HTMLElement | null;
  popupMetalBiasLevel: HTMLElement | null;
  popupElectricEfficiencyLevel: HTMLElement | null;
  popupEnchantBountifulLevel: HTMLElement | null;
  popupEnchantBountifulMinLevel: HTMLElement | null;
  popupEnchantBountifulMaxLevel: HTMLElement | null;
  popupEnrichMinLevel: HTMLElement | null;
  popupEnrichMaxLevel: HTMLElement | null;
  popupEnrichChanceLevel: HTMLElement | null;
  popupSpeedCost: HTMLElement | null;
  popupRadiusCost: HTMLElement | null;
  popupOvertimeCost: HTMLElement | null;
  popupDoubleActivationMinCost: HTMLElement | null;
  popupDoubleActivationMaxCost: HTMLElement | null;
  popupVeinFinderCost: HTMLElement | null;
  popupCritChanceCost: HTMLElement | null;
  popupCritMultiplierCost: HTMLElement | null;
  popupChainReactionCost: HTMLElement | null;
  popupMetalBiasCost: HTMLElement | null;
  popupElectricEfficiencyCost: HTMLElement | null;
  popupEnchantBountifulCost: HTMLElement | null;
  popupEnchantBountifulMinCost: HTMLElement | null;
  popupEnchantBountifulMaxCost: HTMLElement | null;
  popupEnrichMinCost: HTMLElement | null;
  popupEnrichMaxCost: HTMLElement | null;
  popupEnrichChanceCost: HTMLElement | null;
  popupSpeedStat: HTMLElement | null;
  popupRadiusStat: HTMLElement | null;
  popupOvertimeStat: HTMLElement | null;
  popupDoubleActivationMinStat: HTMLElement | null;
  popupDoubleActivationMaxStat: HTMLElement | null;
  popupVeinFinderStat: HTMLElement | null;
  popupCritChanceStat: HTMLElement | null;
  popupCritMultiplierStat: HTMLElement | null;
  popupChainReactionStat: HTMLElement | null;
  popupMetalBiasStat: HTMLElement | null;
  popupElectricEfficiencyStat: HTMLElement | null;
  popupEnchantBountifulStat: HTMLElement | null;
  popupEnchantBountifulMinStat: HTMLElement | null;
  popupEnchantBountifulMaxStat: HTMLElement | null;
  popupEnrichMinStat: HTMLElement | null;
  popupEnrichMaxStat: HTMLElement | null;
  popupEnrichChanceStat: HTMLElement | null;
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
  popupUpgradeMetalBias: HTMLButtonElement | null;
  popupUpgradeElectricEfficiency: HTMLButtonElement | null;
  popupUpgradeEnchantBountiful: HTMLButtonElement | null;
  popupUpgradeEnchantBountifulMin: HTMLButtonElement | null;
  popupUpgradeEnchantBountifulMax: HTMLButtonElement | null;
  popupUpgradeEnrichMin: HTMLButtonElement | null;
  popupUpgradeEnrichMax: HTMLButtonElement | null;
  popupUpgradeEnrichChance: HTMLButtonElement | null;
  popupUpgradeSpeed: HTMLButtonElement | null;
  popupUpgradeRadius: HTMLButtonElement | null;
  popupUpgradeOvertime: HTMLButtonElement | null;
  popupReposition: HTMLButtonElement | null;
}

interface MinerPopupViewModel {
  isVisible: boolean;
  title: string;
  speedLevel: number;
  radiusLevel: number;
  overtimeLevel: number;
  doubleActivationMinLevel: number;
  doubleActivationMaxLevel: number;
  veinFinderLevel: number;
  critChanceLevel: number;
  critMultiplierLevel: number;
  chainReactionLevel: number;
  metalBiasLevel: number;
  electricEfficiencyLevel: number;
  enchantBountifulLevel: number;
  enchantBountifulMinLevel: number;
  enchantBountifulMaxLevel: number;
  enrichMinLevel: number;
  enrichMaxLevel: number;
  enrichChanceLevel: number;
  speedCost: number;
  radiusCost: number;
  overtimeCost: number;
  doubleActivationMinCost: number;
  doubleActivationMaxCost: number;
  veinFinderCost: number;
  critChanceCost: number;
  critMultiplierCost: number;
  chainReactionCost: number;
  metalBiasCost: number;
  electricEfficiencyCost: number;
  enchantBountifulCost: number;
  enchantBountifulMinCost: number;
  enchantBountifulMaxCost: number;
  enrichMinCost: number;
  enrichMaxCost: number;
  enrichChanceCost: number;
  speedStat: string;
  radiusStat: string;
  overtimeStat: string;
  doubleActivationMinStat: string;
  doubleActivationMaxStat: string;
  veinFinderStat: string;
  critChanceStat: string;
  critMultiplierStat: string;
  chainReactionStat: string;
  metalBiasStat: string;
  electricEfficiencyStat: string;
  enchantBountifulStat: string;
  enchantBountifulMinStat: string;
  enchantBountifulMaxStat: string;
  enrichMinStat: string;
  enrichMaxStat: string;
  enrichChanceStat: string;
  specStatus: string;
  canUnlockClass: boolean;
  specAffordable: boolean;
  canChooseClass: boolean;
  targeting: MinerTargeting;
  showDoubleActivation: boolean;
  showVeinFinder: boolean;
  showCrit: boolean;
  showCritChance: boolean;
  showChainLightning: boolean;
  showMetalBias: boolean;
  showElectricEfficiency: boolean;
  showArcanist: boolean;
  showEnchantBountiful: boolean;
  showEnricher: boolean;
  showEnrichChance: boolean;
  showForeman: boolean;
  canBuySpeed: boolean;
  canBuyRadius: boolean;
  canBuyOvertime: boolean;
  canBuyDoubleActivationMin: boolean;
  canBuyDoubleActivationMax: boolean;
  canBuyVeinFinder: boolean;
  canBuyCritChance: boolean;
  canBuyCritMultiplier: boolean;
  canBuyChainReaction: boolean;
  canBuyMetalBias: boolean;
  canBuyElectricEfficiency: boolean;
  canBuyEnchantBountiful: boolean;
  canBuyEnchantBountifulMin: boolean;
  canBuyEnchantBountifulMax: boolean;
  canBuyEnrichMin: boolean;
  canBuyEnrichMax: boolean;
  canBuyEnrichChance: boolean;
  placementMode: boolean;
}

interface MinerStatsUi {
  minerStatsPanel: HTMLElement | null;
  minerStatsTitle: HTMLElement | null;
  statsMinerPosition: HTMLElement | null;
  statsMinerRate: HTMLElement | null;
  statsMinerRadius: HTMLElement | null;
  statsClassDetails: HTMLElement | null;
}

interface MinerStatsViewModel {
  isVisible: boolean;
  title: string;
  positionText: string;
  rateText: string;
  radiusText: string;
  classStatRows: Array<{ label: string; value: string }>;
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
  if (ui.popupOvertimeLevel) ui.popupOvertimeLevel.textContent = view.overtimeLevel.toString();
  if (ui.popupDoubleActivationMinLevel) ui.popupDoubleActivationMinLevel.textContent = view.doubleActivationMinLevel.toString();
  if (ui.popupDoubleActivationMaxLevel) ui.popupDoubleActivationMaxLevel.textContent = view.doubleActivationMaxLevel.toString();
  if (ui.popupVeinFinderLevel) ui.popupVeinFinderLevel.textContent = view.veinFinderLevel.toString();
  if (ui.popupCritChanceLevel) ui.popupCritChanceLevel.textContent = view.critChanceLevel.toString();
  if (ui.popupCritMultiplierLevel) ui.popupCritMultiplierLevel.textContent = view.critMultiplierLevel.toString();
  if (ui.popupChainReactionLevel) ui.popupChainReactionLevel.textContent = view.chainReactionLevel.toString();
  if (ui.popupMetalBiasLevel) ui.popupMetalBiasLevel.textContent = view.metalBiasLevel.toString();
  if (ui.popupElectricEfficiencyLevel) ui.popupElectricEfficiencyLevel.textContent = view.electricEfficiencyLevel.toString();
  if (ui.popupEnchantBountifulLevel) ui.popupEnchantBountifulLevel.textContent = view.enchantBountifulLevel.toString();
  if (ui.popupEnchantBountifulMinLevel) ui.popupEnchantBountifulMinLevel.textContent = view.enchantBountifulMinLevel.toString();
  if (ui.popupEnchantBountifulMaxLevel) ui.popupEnchantBountifulMaxLevel.textContent = view.enchantBountifulMaxLevel.toString();
  if (ui.popupEnrichMinLevel) ui.popupEnrichMinLevel.textContent = view.enrichMinLevel.toString();
  if (ui.popupEnrichMaxLevel) ui.popupEnrichMaxLevel.textContent = view.enrichMaxLevel.toString();
  if (ui.popupEnrichChanceLevel) ui.popupEnrichChanceLevel.textContent = view.enrichChanceLevel.toString();
  if (ui.popupSpeedCost) ui.popupSpeedCost.textContent = view.speedCost.toLocaleString();
  if (ui.popupRadiusCost) ui.popupRadiusCost.textContent = view.radiusCost.toLocaleString();
  if (ui.popupOvertimeCost) ui.popupOvertimeCost.textContent = view.overtimeCost.toLocaleString();
  if (ui.popupDoubleActivationMinCost) ui.popupDoubleActivationMinCost.textContent = view.doubleActivationMinCost.toLocaleString();
  if (ui.popupDoubleActivationMaxCost) ui.popupDoubleActivationMaxCost.textContent = view.doubleActivationMaxCost.toLocaleString();
  if (ui.popupVeinFinderCost) ui.popupVeinFinderCost.textContent = view.veinFinderCost.toLocaleString();
  if (ui.popupCritChanceCost) ui.popupCritChanceCost.textContent = view.critChanceCost.toLocaleString();
  if (ui.popupCritMultiplierCost) ui.popupCritMultiplierCost.textContent = view.critMultiplierCost.toLocaleString();
  if (ui.popupChainReactionCost) ui.popupChainReactionCost.textContent = view.chainReactionCost.toLocaleString();
  if (ui.popupMetalBiasCost) ui.popupMetalBiasCost.textContent = view.metalBiasCost.toLocaleString();
  if (ui.popupElectricEfficiencyCost) ui.popupElectricEfficiencyCost.textContent = view.electricEfficiencyCost.toLocaleString();
  if (ui.popupEnchantBountifulCost) ui.popupEnchantBountifulCost.textContent = view.enchantBountifulCost.toLocaleString();
  if (ui.popupEnchantBountifulMinCost) ui.popupEnchantBountifulMinCost.textContent = view.enchantBountifulMinCost.toLocaleString();
  if (ui.popupEnchantBountifulMaxCost) ui.popupEnchantBountifulMaxCost.textContent = view.enchantBountifulMaxCost.toLocaleString();
  if (ui.popupEnrichMinCost) ui.popupEnrichMinCost.textContent = view.enrichMinCost.toLocaleString();
  if (ui.popupEnrichMaxCost) ui.popupEnrichMaxCost.textContent = view.enrichMaxCost.toLocaleString();
  if (ui.popupEnrichChanceCost) ui.popupEnrichChanceCost.textContent = view.enrichChanceCost.toLocaleString();
  if (ui.popupSpeedStat) ui.popupSpeedStat.textContent = view.speedStat;
  if (ui.popupRadiusStat) ui.popupRadiusStat.textContent = view.radiusStat;
  if (ui.popupOvertimeStat) ui.popupOvertimeStat.textContent = view.overtimeStat;
  if (ui.popupDoubleActivationMinStat) ui.popupDoubleActivationMinStat.textContent = view.doubleActivationMinStat;
  if (ui.popupDoubleActivationMaxStat) ui.popupDoubleActivationMaxStat.textContent = view.doubleActivationMaxStat;
  if (ui.popupVeinFinderStat) ui.popupVeinFinderStat.textContent = view.veinFinderStat;
  if (ui.popupCritChanceStat) ui.popupCritChanceStat.textContent = view.critChanceStat;
  if (ui.popupCritMultiplierStat) ui.popupCritMultiplierStat.textContent = view.critMultiplierStat;
  if (ui.popupChainReactionStat) ui.popupChainReactionStat.textContent = view.chainReactionStat;
  if (ui.popupMetalBiasStat) ui.popupMetalBiasStat.textContent = view.metalBiasStat;
  if (ui.popupElectricEfficiencyStat) ui.popupElectricEfficiencyStat.textContent = view.electricEfficiencyStat;
  if (ui.popupEnchantBountifulStat) ui.popupEnchantBountifulStat.textContent = view.enchantBountifulStat;
  if (ui.popupEnchantBountifulMinStat) ui.popupEnchantBountifulMinStat.textContent = view.enchantBountifulMinStat;
  if (ui.popupEnchantBountifulMaxStat) ui.popupEnchantBountifulMaxStat.textContent = view.enchantBountifulMaxStat;
  if (ui.popupEnrichMinStat) ui.popupEnrichMinStat.textContent = view.enrichMinStat;
  if (ui.popupEnrichMaxStat) ui.popupEnrichMaxStat.textContent = view.enrichMaxStat;
  if (ui.popupEnrichChanceStat) ui.popupEnrichChanceStat.textContent = view.enrichChanceStat;
  if (ui.popupSpecStatus) ui.popupSpecStatus.textContent = view.specStatus;

  if (ui.popupUnlockClass) {
    ui.popupUnlockClass.classList.toggle("hidden", !view.canUnlockClass);
    ui.popupUnlockClass.disabled = !view.canUnlockClass || !view.specAffordable;

    if (view.canUnlockClass && ui.minerPopup) {
      const topUpgradeButton =
        ui.popupUpgradeSpeed ??
        ui.popupUpgradeRadius ??
        ui.popupUpgradeOvertime ??
        ui.popupReposition;

      if (topUpgradeButton && topUpgradeButton.parentElement === ui.minerPopup && ui.popupUnlockClass.parentElement === ui.minerPopup) {
        ui.minerPopup.insertBefore(ui.popupUnlockClass, topUpgradeButton);
      }
    }
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
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.classList.toggle("hidden", !view.showCritChance);
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.classList.toggle("hidden", !view.showCrit);
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.classList.toggle("hidden", !view.showChainLightning);
  if (ui.popupUpgradeMetalBias) ui.popupUpgradeMetalBias.classList.toggle("hidden", !view.showMetalBias);
  if (ui.popupUpgradeElectricEfficiency) ui.popupUpgradeElectricEfficiency.classList.toggle("hidden", !view.showElectricEfficiency);
  if (ui.popupUpgradeEnchantBountiful) ui.popupUpgradeEnchantBountiful.classList.toggle("hidden", !view.showEnchantBountiful);
  if (ui.popupUpgradeEnchantBountifulMin) ui.popupUpgradeEnchantBountifulMin.classList.toggle("hidden", !view.showArcanist);
  if (ui.popupUpgradeEnchantBountifulMax) ui.popupUpgradeEnchantBountifulMax.classList.toggle("hidden", !view.showArcanist);
  if (ui.popupUpgradeEnrichMin) ui.popupUpgradeEnrichMin.classList.toggle("hidden", !view.showEnricher);
  if (ui.popupUpgradeEnrichMax) ui.popupUpgradeEnrichMax.classList.toggle("hidden", !view.showEnricher);
  if (ui.popupUpgradeEnrichChance) ui.popupUpgradeEnrichChance.classList.toggle("hidden", !view.showEnrichChance);
  if (ui.popupUpgradeOvertime) ui.popupUpgradeOvertime.classList.toggle("hidden", !view.showForeman);

  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.disabled = !view.canBuySpeed;
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.disabled = !view.canBuyRadius;
  if (ui.popupUpgradeOvertime) ui.popupUpgradeOvertime.disabled = !view.canBuyOvertime;
  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.disabled = !view.canBuyDoubleActivationMin;
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.disabled = !view.canBuyDoubleActivationMax;
  if (ui.popupUpgradeVeinFinder) ui.popupUpgradeVeinFinder.disabled = !view.canBuyVeinFinder;
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.disabled = !view.canBuyCritChance;
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.disabled = !view.canBuyCritMultiplier;
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.disabled = !view.canBuyChainReaction;
  if (ui.popupUpgradeMetalBias) ui.popupUpgradeMetalBias.disabled = !view.canBuyMetalBias;
  if (ui.popupUpgradeElectricEfficiency) ui.popupUpgradeElectricEfficiency.disabled = !view.canBuyElectricEfficiency;
  if (ui.popupUpgradeEnchantBountiful) ui.popupUpgradeEnchantBountiful.disabled = !view.canBuyEnchantBountiful;
  if (ui.popupUpgradeEnchantBountifulMin) ui.popupUpgradeEnchantBountifulMin.disabled = !view.canBuyEnchantBountifulMin;
  if (ui.popupUpgradeEnchantBountifulMax) ui.popupUpgradeEnchantBountifulMax.disabled = !view.canBuyEnchantBountifulMax;
  if (ui.popupUpgradeEnrichMin) ui.popupUpgradeEnrichMin.disabled = !view.canBuyEnrichMin;
  if (ui.popupUpgradeEnrichMax) ui.popupUpgradeEnrichMax.disabled = !view.canBuyEnrichMax;
  if (ui.popupUpgradeEnrichChance) ui.popupUpgradeEnrichChance.disabled = !view.canBuyEnrichChance;
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
  if (ui.statsMinerRadius) ui.statsMinerRadius.textContent = view.radiusText;
  if (ui.statsClassDetails) {
    ui.statsClassDetails.innerHTML = "";
    for (const statRow of view.classStatRows) {
      const row = document.createElement("p");
      row.className = "miner-stat-row";

      const labelNode = document.createElement("span");
      labelNode.textContent = statRow.label;

      const valueNode = document.createElement("strong");
      valueNode.textContent = statRow.value;

      row.append(labelNode, valueNode);
      ui.statsClassDetails.appendChild(row);
    }
  }
}

import type { OreType, UnitSpecialization } from "./game-types";
import { MOBILE_BREAKPOINT_PX } from "./game-constants";

const SELLABLE_ORES: OreType[] = ["sand", "coal", "copper", "iron", "silver", "gold", "sapphire", "ruby", "emerald", "diamond", "amethyst"];

function isSellableOre(value: unknown): value is OreType {
  return typeof value === "string" && SELLABLE_ORES.includes(value as OreType);
}

interface UiRefs {
  settingsToggle: HTMLElement | null;
  settingsToggleMobile: HTMLElement | null;
  settingsModal: HTMLElement | null;
  inventoryToggle: HTMLButtonElement | null;
  inventoryToggleMobile: HTMLButtonElement | null;
  upgradesToggle: HTMLButtonElement | null;
  upgradesToggleMobile: HTMLButtonElement | null;
  mapToggleMobile: HTMLButtonElement | null;
  workersToggleMobile: HTMLButtonElement | null;
  workersModal: HTMLElement | null;
  closeWorkersModal: HTMLButtonElement | null;
  workerDetailsModal: HTMLElement | null;
  closeWorkerDetailsModalButton: HTMLButtonElement | null;
  workersList: HTMLElement | null;
  inventoryModal: HTMLElement | null;
  upgradesModal: HTMLElement | null;
  closeInventoryModal: HTMLButtonElement | null;
  closeUpgradesModal: HTMLButtonElement | null;
  inventoryAutoSellToggle: HTMLButtonElement | null;
  mapGrid: HTMLElement | null;
  minerRing: HTMLElement | null;
  mapEnvironment: HTMLElement | null;
  popupUpgradeSpeed: HTMLButtonElement | null;
  popupUpgradeRadius: HTMLButtonElement | null;
  popupUpgradeOvertime: HTMLButtonElement | null;
  popupReposition: HTMLButtonElement | null;
  closeMinerPopupButton: HTMLButtonElement | null;
  closeMinerStatsButton: HTMLButtonElement | null;
  toggleUpgradesAccordion: HTMLButtonElement | null;
  resourceStatsToggle: HTMLButtonElement | null;
  closeResourceStatsButton: HTMLButtonElement | null;
  sellAllResources: HTMLButtonElement | null;
  resourceLegendBody: HTMLElement | null;
  inventoryList: HTMLElement | null;
  buyIdleMiner: HTMLButtonElement | null;
  expandMap: HTMLButtonElement | null;
  buyCoalGeneration: HTMLButtonElement | null;
  buyCopperGeneration: HTMLButtonElement | null;
  buyIronGeneration: HTMLButtonElement | null;
  buySilverGeneration: HTMLButtonElement | null;
  buyGoldGeneration: HTMLButtonElement | null;
  buyGemstoneGeneration: HTMLButtonElement | null;
  buySapphireGeneration: HTMLButtonElement | null;
  buyRubyGeneration: HTMLButtonElement | null;
  buyEmeraldGeneration: HTMLButtonElement | null;
  buyDiamondGeneration: HTMLButtonElement | null;
  buyAmethystGeneration: HTMLButtonElement | null;
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
  popupUnlockClass: HTMLButtonElement | null;
  popupChooseClass: HTMLButtonElement | null;
  classPickForeman: HTMLButtonElement | null;
  classPickVeinFinder: HTMLButtonElement | null;
  classPickCrit: HTMLButtonElement | null;
  classPickChainLightning: HTMLButtonElement | null;
  classPickDoubleActivation: HTMLButtonElement | null;
  classPickArcanist: HTMLButtonElement | null;
  classPickEnricher: HTMLButtonElement | null;
  classModalClose: HTMLButtonElement | null;
  classModal: HTMLElement | null;
  popupTargetingRandom: HTMLButtonElement | null;
  popupTargetingHigh: HTMLButtonElement | null;
  popupTargetingLow: HTMLButtonElement | null;
  save: HTMLButtonElement | null;
  addCoins: HTMLButtonElement | null;
  toggleLeftHandedMode: HTMLButtonElement | null;
  reset: HTMLButtonElement | null;
}

interface BindUiEventsArgs {
  ui: UiRefs;
  state: { idleMinerOwned: number };
  interactionState: { placementMode: boolean; selectedMinerIndex: number | null };
  setSettingsModalOpen: (isOpen: boolean) => void;
  setWorkersModalOpen: (isOpen: boolean) => void;
  closeMinerPanels: () => void;
  closeResourceStatsPanel: () => void;
  setClassModalOpen: (isOpen: boolean) => void;
  setInventoryModalOpen: (isOpen: boolean) => void;
  setUpgradesModalOpen: (isOpen: boolean) => void;
  toggleInventoryAutoSell: () => void;
  toggleLeftHandedMode: () => void;
  openWorkersPanel: () => void;
  selectWorkerFromList: (workerIndex: number) => void;
  activateTile: (tile: HTMLElement) => void;
  openMinerPanels: (minerIndex: number) => void;
  moveMinerToPointer: (clientX: number, clientY: number) => void;
  render: () => void;
  buyMinerSpeedUpgrade: () => void;
  buyMinerRadiusUpgrade: () => void;
  buyOvertimeUpgrade: () => void;
  toggleMinerRepositionMode: () => void;
  closeMinerUpgradePanel: () => void;
  closeMinerStatsPanel: () => void;
  toggleUpgradesAccordion: () => void;
  toggleResourceStatsPanel: () => void;
  buyIdleMiner: () => void;
  buyMapExpansion: () => void;
  buyCoalGeneration: () => void;
  buyCopperGeneration: () => void;
  buyIronGeneration: () => void;
  buySilverGeneration: () => void;
  buyGoldGeneration: () => void;
  buyGemstoneGeneration: () => void;
  buySapphireGeneration: () => void;
  buyRubyGeneration: () => void;
  buyEmeraldGeneration: () => void;
  buyDiamondGeneration: () => void;
  buyAmethystGeneration: () => void;
  sellOneResource: (ore: OreType) => void;
  sellAllByResource: (ore: OreType) => void;
  sellAllResources: () => void;
  buyDoubleActivationMin: () => void;
  buyDoubleActivationMax: () => void;
  buyVeinFinderUpgrade: () => void;
  buyCritChanceUpgrade: () => void;
  buyCritMultiplierUpgrade: () => void;
  buyChainReactionUpgrade: () => void;
  buyMetalBiasUpgrade: () => void;
  buyElectricEfficiencyUpgrade: () => void;
  buyEnchantBountifulUpgrade: () => void;
  buyEnchantBountifulMinUpgrade: () => void;
  buyEnchantBountifulMaxUpgrade: () => void;
  buyEnrichMinUpgrade: () => void;
  buyEnrichMaxUpgrade: () => void;
  buyEnrichChanceUpgrade: () => void;
  unlockClassChoice: () => void;
  selectMinerSpecialization: (spec: Exclude<UnitSpecialization, "Worker">) => void;
  setMinerTargeting: (mode: "random" | "high-quality" | "low-quality") => void;
  saveGame: (showStatus?: boolean) => void;
  addCoinsCheat: () => void;
  resetGame: () => void;
  setDevLogModalOpen: (isOpen: boolean) => void;
}

export function bindUiEvents(args: BindUiEventsArgs): void {
  const {
    ui,
    state,
    interactionState,
    setSettingsModalOpen,
    setWorkersModalOpen,
    closeMinerPanels,
    closeResourceStatsPanel,
    setClassModalOpen,
    setInventoryModalOpen,
    setUpgradesModalOpen,
    toggleInventoryAutoSell,
    toggleLeftHandedMode,
    openWorkersPanel,
    selectWorkerFromList,
    activateTile,
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
    buyGemstoneGeneration,
    buySapphireGeneration,
    buyRubyGeneration,
    buyEmeraldGeneration,
    buyDiamondGeneration,
    buyAmethystGeneration,
    sellOneResource,
    sellAllByResource,
    sellAllResources,
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
    addCoinsCheat,
    resetGame,
    setDevLogModalOpen,
  } = args;

  let placementDragActive = false;

  function handlePlacementPointer(clientX: number, clientY: number, target: HTMLElement): void {
    const tile = target.closest(".map-tile") as HTMLElement | null;
    if (tile) {
      const tileBounds = tile.getBoundingClientRect();
      moveMinerToPointer(tileBounds.left + tileBounds.width / 2, tileBounds.top + tileBounds.height / 2);
    } else {
      moveMinerToPointer(clientX, clientY);
    }
    render();
  }

  function finalizeDesktopPlacement(): void {
    if (window.innerWidth <= MOBILE_BREAKPOINT_PX || !interactionState.placementMode) {
      return;
    }
    interactionState.placementMode = false;
    placementDragActive = false;
    render();
  }

  if (ui.settingsToggle) {
    ui.settingsToggle.addEventListener("click", () => {
      if (!ui.settingsModal) return;
      const isHidden = ui.settingsModal.classList.contains("hidden");
      setSettingsModalOpen(isHidden);
    });
  }

  if (ui.settingsToggleMobile) {
    ui.settingsToggleMobile.addEventListener("click", () => {
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

  if (ui.inventoryToggle) {
    ui.inventoryToggle.addEventListener("click", () => {
      if (!ui.inventoryModal) return;
      const isHidden = ui.inventoryModal.classList.contains("hidden");
      setInventoryModalOpen(isHidden);
    });
  }

  if (ui.inventoryToggleMobile) {
    ui.inventoryToggleMobile.addEventListener("click", () => {
      setInventoryModalOpen(true);
    });
  }

  if (ui.closeInventoryModal) {
    ui.closeInventoryModal.addEventListener("click", () => {
      setInventoryModalOpen(false);
    });
  }

  if (ui.upgradesToggle) {
    ui.upgradesToggle.addEventListener("click", () => {
      if (!ui.upgradesModal) return;
      const isHidden = ui.upgradesModal.classList.contains("hidden");
      setUpgradesModalOpen(isHidden);
    });
  }

  if (ui.upgradesToggleMobile) {
    ui.upgradesToggleMobile.addEventListener("click", () => {
      setUpgradesModalOpen(true);
    });
  }

  if (ui.mapToggleMobile) {
    ui.mapToggleMobile.addEventListener("click", () => {
      setInventoryModalOpen(false);
      setUpgradesModalOpen(false);
      setWorkersModalOpen(false);
      setSettingsModalOpen(false);
    });
  }

  if (ui.workersToggleMobile) {
    ui.workersToggleMobile.addEventListener("click", openWorkersPanel);
  }

  if (ui.closeWorkersModal) {
    ui.closeWorkersModal.addEventListener("click", () => {
      setWorkersModalOpen(false);
    });
  }

  if (ui.closeWorkerDetailsModalButton) {
    ui.closeWorkerDetailsModalButton.addEventListener("click", closeMinerPanels);
  }

  if (ui.workersModal) {
    ui.workersModal.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest(".modal-card")) {
        return;
      }
      setWorkersModalOpen(false);
    });
  }

  if (ui.workerDetailsModal) {
    ui.workerDetailsModal.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest(".modal-card")) {
        return;
      }
      closeMinerPanels();
    });
  }

  if (ui.workersList) {
    ui.workersList.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const workerButton = target.closest(".workers-list-item") as HTMLButtonElement | null;
      if (!(workerButton instanceof HTMLButtonElement)) {
        return;
      }

      const workerIndex = Number(workerButton.dataset.workerIndex);
      if (!Number.isInteger(workerIndex) || workerIndex < 0 || workerIndex >= state.idleMinerOwned) {
        return;
      }

      selectWorkerFromList(workerIndex);
    });
  }

  if (ui.closeUpgradesModal) {
    ui.closeUpgradesModal.addEventListener("click", () => {
      setUpgradesModalOpen(false);
    });
  }

  if (ui.inventoryAutoSellToggle) {
    ui.inventoryAutoSellToggle.addEventListener("click", toggleInventoryAutoSell);
  }

  if (ui.inventoryModal) {
    ui.inventoryModal.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest(".modal-card")) {
        return;
      }
      setInventoryModalOpen(false);
    });
  }

  if (ui.upgradesModal) {
    ui.upgradesModal.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest(".modal-card")) {
        return;
      }
      setUpgradesModalOpen(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSettingsModalOpen(false);
      closeMinerPanels();
      closeResourceStatsPanel();
      setClassModalOpen(false);
      setInventoryModalOpen(false);
      setUpgradesModalOpen(false);
      setWorkersModalOpen(false);
      setDevLogModalOpen(false);
    }
  });

  if (ui.mapGrid) {
    ui.mapGrid.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (interactionState.placementMode) {
        if (window.innerWidth <= MOBILE_BREAKPOINT_PX) {
          event.preventDefault();
          placementDragActive = true;
          handlePlacementPointer(event.clientX, event.clientY, target);
          return;
        }
        handlePlacementPointer(event.clientX, event.clientY, target);
        finalizeDesktopPlacement();
        return;
      }

      event.preventDefault();

      if (!target.classList.contains("map-tile")) {
        return;
      }
      activateTile(target);
    });

    ui.mapGrid.addEventListener("click", (event) => {
      if (!interactionState.placementMode) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      handlePlacementPointer(event.clientX, event.clientY, target);
      finalizeDesktopPlacement();
    });
  }

  if (ui.minerRing) {
    ui.minerRing.addEventListener("pointerdown", (event) => {
      if (interactionState.placementMode && window.innerWidth <= MOBILE_BREAKPOINT_PX) {
        return;
      }

      if (window.innerWidth <= MOBILE_BREAKPOINT_PX) {
        return;
      }

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
    if (interactionState.placementMode && window.innerWidth > MOBILE_BREAKPOINT_PX) {
      moveMinerToPointer(event.clientX, event.clientY);
      render();
      return;
    }

    if (!placementDragActive) {
      return;
    }
    moveMinerToPointer(event.clientX, event.clientY);
    render();
  });

  window.addEventListener("pointerup", () => {
    placementDragActive = false;
  });

  window.addEventListener("pointercancel", () => {
    placementDragActive = false;
  });

  if (ui.mapEnvironment) {
    ui.mapEnvironment.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (!interactionState.placementMode) {
        return;
      }

      if (window.innerWidth <= MOBILE_BREAKPOINT_PX) {
        event.preventDefault();
        placementDragActive = true;
        handlePlacementPointer(event.clientX, event.clientY, target);
        return;
      }
      handlePlacementPointer(event.clientX, event.clientY, target);
      finalizeDesktopPlacement();
    });

    ui.mapEnvironment.addEventListener("pointermove", (event) => {
      if (!interactionState.placementMode || !placementDragActive) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      handlePlacementPointer(event.clientX, event.clientY, target);
    });

    ui.mapEnvironment.addEventListener("click", (event) => {
      if (!interactionState.placementMode) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();

      const tile = target.closest(".map-tile") as HTMLElement | null;
      if (tile) {
        const tileBounds = tile.getBoundingClientRect();
        moveMinerToPointer(tileBounds.left + tileBounds.width / 2, tileBounds.top + tileBounds.height / 2);
      } else {
        moveMinerToPointer(event.clientX, event.clientY);
      }

      if (window.innerWidth > MOBILE_BREAKPOINT_PX) {
        interactionState.placementMode = false;
        placementDragActive = false;
      }
      render();
    });
  }

  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.addEventListener("click", buyMinerSpeedUpgrade);
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.addEventListener("click", buyMinerRadiusUpgrade);
  if (ui.popupUpgradeOvertime) ui.popupUpgradeOvertime.addEventListener("click", buyOvertimeUpgrade);
  if (ui.popupReposition) ui.popupReposition.addEventListener("click", toggleMinerRepositionMode);
  if (ui.closeMinerPopupButton) ui.closeMinerPopupButton.addEventListener("click", closeMinerUpgradePanel);
  if (ui.closeMinerStatsButton) ui.closeMinerStatsButton.addEventListener("click", closeMinerStatsPanel);
  if (ui.toggleUpgradesAccordion) ui.toggleUpgradesAccordion.addEventListener("click", toggleUpgradesAccordion);
  if (ui.resourceStatsToggle) ui.resourceStatsToggle.addEventListener("click", toggleResourceStatsPanel);
  if (ui.closeResourceStatsButton) ui.closeResourceStatsButton.addEventListener("click", closeResourceStatsPanel);
  if (ui.buyIdleMiner) ui.buyIdleMiner.addEventListener("click", buyIdleMiner);
  if (ui.expandMap) ui.expandMap.addEventListener("click", buyMapExpansion);
  if (ui.buyCoalGeneration) ui.buyCoalGeneration.addEventListener("click", buyCoalGeneration);
  if (ui.buyCopperGeneration) ui.buyCopperGeneration.addEventListener("click", buyCopperGeneration);
  if (ui.buyIronGeneration) ui.buyIronGeneration.addEventListener("click", buyIronGeneration);
  if (ui.buySilverGeneration) ui.buySilverGeneration.addEventListener("click", buySilverGeneration);
  if (ui.buyGoldGeneration) ui.buyGoldGeneration.addEventListener("click", buyGoldGeneration);
  if (ui.buyGemstoneGeneration) ui.buyGemstoneGeneration.addEventListener("click", buyGemstoneGeneration);
  if (ui.buySapphireGeneration) ui.buySapphireGeneration.addEventListener("click", buySapphireGeneration);
  if (ui.buyRubyGeneration) ui.buyRubyGeneration.addEventListener("click", buyRubyGeneration);
  if (ui.buyEmeraldGeneration) ui.buyEmeraldGeneration.addEventListener("click", buyEmeraldGeneration);
  if (ui.buyDiamondGeneration) ui.buyDiamondGeneration.addEventListener("click", buyDiamondGeneration);
  if (ui.buyAmethystGeneration) ui.buyAmethystGeneration.addEventListener("click", buyAmethystGeneration);
  if (ui.sellAllResources) ui.sellAllResources.addEventListener("click", sellAllResources);
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const sellOneButton = target.closest(".resource-sell-btn") as HTMLButtonElement | null;
    if (sellOneButton instanceof HTMLButtonElement) {
      const ore = sellOneButton.dataset.ore;
      if (isSellableOre(ore)) {
        sellOneResource(ore);
      }
      return;
    }

    const sellAllByResourceButton = target.closest(".inventory-sell-all-btn") as HTMLButtonElement | null;
    if (sellAllByResourceButton instanceof HTMLButtonElement) {
      const ore = sellAllByResourceButton.dataset.ore;
      if (isSellableOre(ore)) {
        sellAllByResource(ore);
      }
      return;
    }

  });
  if (ui.popupUpgradeDoubleActivationMin) ui.popupUpgradeDoubleActivationMin.addEventListener("click", buyDoubleActivationMin);
  if (ui.popupUpgradeDoubleActivationMax) ui.popupUpgradeDoubleActivationMax.addEventListener("click", buyDoubleActivationMax);
  if (ui.popupUpgradeVeinFinder) ui.popupUpgradeVeinFinder.addEventListener("click", buyVeinFinderUpgrade);
  if (ui.popupUpgradeCritChance) ui.popupUpgradeCritChance.addEventListener("click", buyCritChanceUpgrade);
  if (ui.popupUpgradeCritMultiplier) ui.popupUpgradeCritMultiplier.addEventListener("click", buyCritMultiplierUpgrade);
  if (ui.popupUpgradeChainReaction) ui.popupUpgradeChainReaction.addEventListener("click", buyChainReactionUpgrade);
  if (ui.popupUpgradeMetalBias) ui.popupUpgradeMetalBias.addEventListener("click", buyMetalBiasUpgrade);
  if (ui.popupUpgradeElectricEfficiency) ui.popupUpgradeElectricEfficiency.addEventListener("click", buyElectricEfficiencyUpgrade);
  if (ui.popupUpgradeEnchantBountiful) ui.popupUpgradeEnchantBountiful.addEventListener("click", buyEnchantBountifulUpgrade);
  if (ui.popupUpgradeEnchantBountifulMin) ui.popupUpgradeEnchantBountifulMin.addEventListener("click", buyEnchantBountifulMinUpgrade);
  if (ui.popupUpgradeEnchantBountifulMax) ui.popupUpgradeEnchantBountifulMax.addEventListener("click", buyEnchantBountifulMaxUpgrade);
  if (ui.popupUpgradeEnrichMin) ui.popupUpgradeEnrichMin.addEventListener("click", buyEnrichMinUpgrade);
  if (ui.popupUpgradeEnrichMax) ui.popupUpgradeEnrichMax.addEventListener("click", buyEnrichMaxUpgrade);
  if (ui.popupUpgradeEnrichChance) ui.popupUpgradeEnrichChance.addEventListener("click", buyEnrichChanceUpgrade);
  if (ui.popupUnlockClass) ui.popupUnlockClass.addEventListener("click", unlockClassChoice);
  if (ui.popupChooseClass) ui.popupChooseClass.addEventListener("click", () => setClassModalOpen(true));
  if (ui.classPickForeman) ui.classPickForeman.addEventListener("click", () => selectMinerSpecialization("Foreman"));
  if (ui.classPickVeinFinder) ui.classPickVeinFinder.addEventListener("click", () => selectMinerSpecialization("Prospector"));
  if (ui.classPickCrit) ui.classPickCrit.addEventListener("click", () => selectMinerSpecialization("Crit Build"));
  if (ui.classPickChainLightning) ui.classPickChainLightning.addEventListener("click", () => selectMinerSpecialization("Chain Lightning"));
  if (ui.classPickDoubleActivation) ui.classPickDoubleActivation.addEventListener("click", () => selectMinerSpecialization("Multi Activator"));
  if (ui.classPickArcanist) ui.classPickArcanist.addEventListener("click", () => selectMinerSpecialization("Arcanist"));
  if (ui.classPickEnricher) ui.classPickEnricher.addEventListener("click", () => selectMinerSpecialization("Enricher"));
  if (ui.classModalClose) ui.classModalClose.addEventListener("click", () => setClassModalOpen(false));
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
  if (ui.popupTargetingRandom) ui.popupTargetingRandom.addEventListener("click", () => setMinerTargeting("random"));
  if (ui.popupTargetingHigh) ui.popupTargetingHigh.addEventListener("click", () => setMinerTargeting("high-quality"));
  if (ui.popupTargetingLow) ui.popupTargetingLow.addEventListener("click", () => setMinerTargeting("low-quality"));
  if (ui.save) ui.save.addEventListener("click", () => saveGame(true));
  if (ui.addCoins) ui.addCoins.addEventListener("click", addCoinsCheat);
  if (ui.toggleLeftHandedMode) ui.toggleLeftHandedMode.addEventListener("click", toggleLeftHandedMode);
  if (ui.reset) ui.reset.addEventListener("click", resetGame);
}

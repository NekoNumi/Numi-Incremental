import type { UnitSpecialization } from "./game-types";

interface UiRefs {
  settingsToggle: HTMLElement | null;
  settingsModal: HTMLElement | null;
  inventoryToggle: HTMLButtonElement | null;
  inventoryModal: HTMLElement | null;
  closeInventoryModal: HTMLButtonElement | null;
  mapGrid: HTMLElement | null;
  minerRing: HTMLElement | null;
  mapEnvironment: HTMLElement | null;
  popupUpgradeSpeed: HTMLButtonElement | null;
  popupUpgradeRadius: HTMLButtonElement | null;
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
  popupUpgradeDoubleActivationMin: HTMLButtonElement | null;
  popupUpgradeDoubleActivationMax: HTMLButtonElement | null;
  popupUpgradeVeinFinder: HTMLButtonElement | null;
  popupUpgradeCritChance: HTMLButtonElement | null;
  popupUpgradeCritMultiplier: HTMLButtonElement | null;
  popupUpgradeChainReaction: HTMLButtonElement | null;
  popupUpgradeEnchantBountiful: HTMLButtonElement | null;
  popupUnlockClass: HTMLButtonElement | null;
  popupChooseClass: HTMLButtonElement | null;
  classPickVeinFinder: HTMLButtonElement | null;
  classPickCrit: HTMLButtonElement | null;
  classPickChainLightning: HTMLButtonElement | null;
  classPickDoubleActivation: HTMLButtonElement | null;
  classPickArcanist: HTMLButtonElement | null;
  classModalClose: HTMLButtonElement | null;
  classModal: HTMLElement | null;
  popupTargetingRandom: HTMLButtonElement | null;
  popupTargetingHigh: HTMLButtonElement | null;
  popupTargetingLow: HTMLButtonElement | null;
  save: HTMLButtonElement | null;
  reset: HTMLButtonElement | null;
}

interface BindUiEventsArgs {
  ui: UiRefs;
  state: { idleMinerOwned: number };
  interactionState: { placementMode: boolean; selectedMinerIndex: number | null };
  setSettingsModalOpen: (isOpen: boolean) => void;
  closeMinerPanels: () => void;
  closeResourceStatsPanel: () => void;
  setClassModalOpen: (isOpen: boolean) => void;
  setInventoryModalOpen: (isOpen: boolean) => void;
  activateTile: (tile: HTMLElement) => void;
  openMinerPanels: (minerIndex: number) => void;
  moveMinerToPointer: (clientX: number, clientY: number) => void;
  render: () => void;
  buyMinerSpeedUpgrade: () => void;
  buyMinerRadiusUpgrade: () => void;
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
  sellOneResource: (ore: "sand" | "coal" | "copper" | "iron" | "silver" | "gold") => void;
  sellAllByResource: (ore: "sand" | "coal" | "copper" | "iron" | "silver" | "gold") => void;
  sellAllResources: () => void;
  buyDoubleActivationMin: () => void;
  buyDoubleActivationMax: () => void;
  buyVeinFinderUpgrade: () => void;
  buyCritChanceUpgrade: () => void;
  buyCritMultiplierUpgrade: () => void;
  buyChainReactionUpgrade: () => void;
  buyEnchantBountifulUpgrade: () => void;
  unlockClassChoice: () => void;
  selectMinerSpecialization: (spec: Exclude<UnitSpecialization, "Worker">) => void;
  setMinerTargeting: (mode: "random" | "high-quality" | "low-quality") => void;
  saveGame: (showStatus?: boolean) => void;
  resetGame: () => void;
}

export function bindUiEvents(args: BindUiEventsArgs): void {
  const {
    ui,
    state,
    interactionState,
    setSettingsModalOpen,
    closeMinerPanels,
    closeResourceStatsPanel,
    setClassModalOpen,
    setInventoryModalOpen,
    activateTile,
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
    sellOneResource,
    sellAllByResource,
    sellAllResources,
    buyDoubleActivationMin,
    buyDoubleActivationMax,
    buyVeinFinderUpgrade,
    buyCritChanceUpgrade,
    buyCritMultiplierUpgrade,
    buyChainReactionUpgrade,
    buyEnchantBountifulUpgrade,
    unlockClassChoice,
    selectMinerSpecialization,
    setMinerTargeting,
    saveGame,
    resetGame,
  } = args;

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

  if (ui.inventoryToggle) {
    ui.inventoryToggle.addEventListener("click", () => {
      if (!ui.inventoryModal) return;
      const isHidden = ui.inventoryModal.classList.contains("hidden");
      setInventoryModalOpen(isHidden);
    });
  }

  if (ui.closeInventoryModal) {
    ui.closeInventoryModal.addEventListener("click", () => {
      setInventoryModalOpen(false);
    });
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSettingsModalOpen(false);
      closeMinerPanels();
      closeResourceStatsPanel();
      setClassModalOpen(false);
      setInventoryModalOpen(false);
    }
  });

  if (ui.mapGrid) {
    ui.mapGrid.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      event.preventDefault();

      if (interactionState.placementMode && interactionState.selectedMinerIndex !== null) {
        return;
      }

      if (!target.classList.contains("map-tile")) {
        return;
      }
      activateTile(target);
    });
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
    moveMinerToPointer(event.clientX, event.clientY);
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
    });
  }

  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.addEventListener("click", buyMinerSpeedUpgrade);
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.addEventListener("click", buyMinerRadiusUpgrade);
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
  if (ui.sellAllResources) ui.sellAllResources.addEventListener("click", sellAllResources);
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const sellOneButton = target.closest(".resource-sell-btn") as HTMLButtonElement | null;
    if (sellOneButton instanceof HTMLButtonElement) {
      const ore = sellOneButton.dataset.ore;
      if (ore === "sand" || ore === "coal" || ore === "copper" || ore === "iron" || ore === "silver" || ore === "gold") {
        sellOneResource(ore);
      }
      return;
    }

    const sellAllByResourceButton = target.closest(".inventory-sell-all-btn") as HTMLButtonElement | null;
    if (sellAllByResourceButton instanceof HTMLButtonElement) {
      const ore = sellAllByResourceButton.dataset.ore;
      if (ore === "sand" || ore === "coal" || ore === "copper" || ore === "iron" || ore === "silver" || ore === "gold") {
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
  if (ui.popupUpgradeEnchantBountiful) ui.popupUpgradeEnchantBountiful.addEventListener("click", buyEnchantBountifulUpgrade);
  if (ui.popupUnlockClass) ui.popupUnlockClass.addEventListener("click", unlockClassChoice);
  if (ui.popupChooseClass) ui.popupChooseClass.addEventListener("click", () => setClassModalOpen(true));
  if (ui.classPickVeinFinder) ui.classPickVeinFinder.addEventListener("click", () => selectMinerSpecialization("Prospector"));
  if (ui.classPickCrit) ui.classPickCrit.addEventListener("click", () => selectMinerSpecialization("Crit Build"));
  if (ui.classPickChainLightning) ui.classPickChainLightning.addEventListener("click", () => selectMinerSpecialization("Chain Lightning"));
  if (ui.classPickDoubleActivation) ui.classPickDoubleActivation.addEventListener("click", () => selectMinerSpecialization("Multi Activator"));
  if (ui.classPickArcanist) ui.classPickArcanist.addEventListener("click", () => selectMinerSpecialization("Arcanist"));
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
  if (ui.reset) ui.reset.addEventListener("click", resetGame);
}

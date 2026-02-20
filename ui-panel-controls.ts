interface UiPanelControlsRefs {
  settingsModal: HTMLElement | null;
  settingsToggle: HTMLElement | null;
  classModal: HTMLElement | null;
  minerPopup: HTMLElement | null;
  minerStatsPanel: HTMLElement | null;
}

interface InteractionPanelState {
  selectedMinerIndex: number | null;
  repositionMode: boolean;
  resourceStatsOpen: boolean;
  upgradePanelOpen: boolean;
  statsPanelOpen: boolean;
  upgradesAccordionOpen: boolean;
  placementMode: boolean;
  activeMinerIndex: number | null;
}

interface CreateUiPanelControlsArgs {
  ui: UiPanelControlsRefs;
  interactionState: InteractionPanelState;
  renderResourceStatsPanel: () => void;
  renderMinerStatsPanel: () => void;
  renderMinerPopup: () => void;
  renderUpgradesAccordion: () => void;
}

export function createUiPanelControls(args: CreateUiPanelControlsArgs): {
  setSettingsModalOpen: (isOpen: boolean) => void;
  setClassModalOpen: (isOpen: boolean) => void;
  openMinerPanels: (minerIndex: number) => void;
  toggleResourceStatsPanel: () => void;
  closeResourceStatsPanel: () => void;
  toggleUpgradesAccordion: () => void;
  closeMinerUpgradePanel: () => void;
  closeMinerStatsPanel: () => void;
  closeMinerPanels: () => void;
} {
  const {
    ui,
    interactionState,
    renderResourceStatsPanel,
    renderMinerStatsPanel,
    renderMinerPopup,
    renderUpgradesAccordion,
  } = args;

  function setSettingsModalOpen(isOpen: boolean): void {
    if (!ui.settingsModal || !ui.settingsToggle) return;
    ui.settingsModal.classList.toggle("hidden", !isOpen);
    ui.settingsModal.setAttribute("aria-hidden", String(!isOpen));
    ui.settingsToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function setClassModalOpen(isOpen: boolean): void {
    if (!ui.classModal) return;
    ui.classModal.classList.toggle("hidden", !isOpen);
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

  return {
    setSettingsModalOpen,
    setClassModalOpen,
    openMinerPanels,
    toggleResourceStatsPanel,
    closeResourceStatsPanel,
    toggleUpgradesAccordion,
    closeMinerUpgradePanel,
    closeMinerStatsPanel,
    closeMinerPanels,
  };
}

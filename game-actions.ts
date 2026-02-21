import type { GameState, UpgradableOre } from "./game-types";

interface CreateGameActionsArgs {
  state: GameState;
  maxMapSize: number;
  saveKey: string;
  clearSavedGame: (saveKey: string) => void;
  createDefaultResources: () => GameState["resources"];
  createEmptyInventory: () => GameState["inventory"];
  canAfford: (cost: number) => boolean;
  getIdleMinerCost: () => number;
  getMapExpansionCost: () => number;
  getOreGenerationCost: (ore: UpgradableOre) => number;
  canIncreaseOreGeneration: (ore: UpgradableOre) => boolean;
  getOreGenerationLevel: (ore: UpgradableOre) => number;
  setOreGenerationLevel: (ore: UpgradableOre, level: number) => void;
  syncIdleMinerState: () => void;
  closeMinerPanels: () => void;
  render: () => void;
  setSettingsModalOpen: (isOpen: boolean) => void;
  setStatus: (message: string) => void;
}

export function createGameActions(args: CreateGameActionsArgs): {
  buyIdleMiner: () => void;
  resetGame: () => void;
  buyMapExpansion: () => void;
  buyCoalGeneration: () => void;
  buyCopperGeneration: () => void;
  buyIronGeneration: () => void;
  buySilverGeneration: () => void;
  buyGoldGeneration: () => void;
  buySapphireGeneration: () => void;
  buyRubyGeneration: () => void;
  buyEmeraldGeneration: () => void;
  buyDiamondGeneration: () => void;
  buyAmethystGeneration: () => void;
} {
  const {
    state,
    maxMapSize,
    saveKey,
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
  } = args;

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

  function resetGame(): void {
    clearSavedGame(saveKey);
    state.coins = 0;
    state.activePlaySeconds = 0;
    state.autoSellEnabled = false;
    state.leftHandedMode = false;
    state.idleMinerOwned = 0;
    state.mapExpansions = 0;
    state.resources = createDefaultResources();
    state.inventory = createEmptyInventory();
    state.lastTick = Date.now();
    state.lastRenderedMapSize = 0;
    state.idleMinerCooldowns = [];
    state.idleMinerPositions = [];
    state.units = [];
    closeMinerPanels();
    render();
    setSettingsModalOpen(false);
    setStatus("Progress reset.");
  }

  function buyMapExpansion(): void {
    if (state.mapExpansions >= maxMapSize - 1) {
      return;
    }
    const cost = getMapExpansionCost();
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    state.mapExpansions += 1;
    render();
  }

  function buyOreGeneration(ore: UpgradableOre): void {
    if (!canIncreaseOreGeneration(ore)) {
      return;
    }

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

  function buySapphireGeneration(): void {
    buyOreGeneration("sapphire");
  }

  function buyRubyGeneration(): void {
    buyOreGeneration("ruby");
  }

  function buyEmeraldGeneration(): void {
    buyOreGeneration("emerald");
  }

  function buyDiamondGeneration(): void {
    buyOreGeneration("diamond");
  }

  function buyAmethystGeneration(): void {
    buyOreGeneration("amethyst");
  }

  return {
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
  };
}

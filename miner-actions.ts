import type { GameState } from "./game-types";

interface MinerActionsInteractionState {
  selectedMinerIndex: number | null;
  placementMode: boolean;
}

interface CreateMinerActionsArgs {
  state: GameState;
  interactionState: MinerActionsInteractionState;
  canAfford: (cost: number) => boolean;
  canUseClass: (minerIndex: number, spec: "Multi Activator" | "Prospector" | "Crit Build" | "Chain Lightning") => boolean;
  render: () => void;
  getMinerSpeedUpgradeCost: (minerIndex: number) => number;
  getMinerRadiusUpgradeCost: (minerIndex: number) => number;
  getMinerCooldownSeconds: (minerIndex: number) => number;
  getDoubleActivationMinCost: (minerIndex: number) => number;
  getDoubleActivationMaxCost: (minerIndex: number) => number;
  getVeinFinderCost: (minerIndex: number) => number;
  getCritChanceCost: (minerIndex: number) => number;
  getCritMultiplierCost: (minerIndex: number) => number;
  getChainReactionCost: (minerIndex: number) => number;
}

export function createMinerActions(args: CreateMinerActionsArgs): {
  buyMinerSpeedUpgrade: () => void;
  buyMinerRadiusUpgrade: () => void;
  toggleMinerRepositionMode: () => void;
  buyDoubleActivationMin: () => void;
  buyDoubleActivationMax: () => void;
  buyVeinFinderUpgrade: () => void;
  buyCritChanceUpgrade: () => void;
  buyCritMultiplierUpgrade: () => void;
  buyChainReactionUpgrade: () => void;
} {
  const {
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
  } = args;

  function buyMinerSpeedUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) {
      return;
    }

    const cost = getMinerSpeedUpgradeCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }

    const previousCooldown = getMinerCooldownSeconds(minerIndex);
    state.coins -= cost;
    state.units[minerIndex].speedLevel += 1;
    const updatedCooldown = getMinerCooldownSeconds(minerIndex);

    if (Number.isFinite(previousCooldown) && previousCooldown > 0) {
      const scale = updatedCooldown / previousCooldown;
      state.idleMinerCooldowns[minerIndex] = Math.max(0, state.idleMinerCooldowns[minerIndex] * scale);
    }

    render();
  }

  function buyMinerRadiusUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) {
      return;
    }

    const cost = getMinerRadiusUpgradeCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }

    state.coins -= cost;
    state.units[minerIndex].radiusLevel += 1;
    render();
  }

  function toggleMinerRepositionMode(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) {
      return;
    }

    interactionState.placementMode = !interactionState.placementMode;
    render();
  }

  function buyDoubleActivationMin(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Multi Activator")) return;
    const cost = getDoubleActivationMinCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Multi Activator") {
      data.multiActivationMinLevel += 1;
    }
    render();
  }

  function buyDoubleActivationMax(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Multi Activator")) return;
    const cost = getDoubleActivationMaxCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Multi Activator") {
      data.multiActivationMaxLevel += 1;
    }
    render();
  }

  function buyVeinFinderUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Prospector")) return;
    const cost = getVeinFinderCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Prospector") {
      data.veinFinderLevel += 1;
    }
    render();
  }

  function buyCritChanceUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Crit Build")) return;
    const cost = getCritChanceCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Crit Build") {
      data.critChanceLevel += 1;
    }
    render();
  }

  function buyCritMultiplierUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Crit Build")) return;
    const cost = getCritMultiplierCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Crit Build") {
      data.critMultiplierLevel += 1;
    }
    render();
  }

  function buyChainReactionUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Chain Lightning")) return;
    const cost = getChainReactionCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Chain Lightning") {
      data.chainReactionLevel += 1;
    }
    render();
  }

  return {
    buyMinerSpeedUpgrade,
    buyMinerRadiusUpgrade,
    toggleMinerRepositionMode,
    buyDoubleActivationMin,
    buyDoubleActivationMax,
    buyVeinFinderUpgrade,
    buyCritChanceUpgrade,
    buyCritMultiplierUpgrade,
    buyChainReactionUpgrade,
  };
}

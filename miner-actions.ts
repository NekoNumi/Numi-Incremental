import type { GameState } from "./game-types";

interface MinerActionsInteractionState {
  selectedMinerIndex: number | null;
  placementMode: boolean;
}

interface CreateMinerActionsArgs {
  state: GameState;
  interactionState: MinerActionsInteractionState;
  canAfford: (cost: number) => boolean;
  canUseClass: (minerIndex: number, spec: "Multi Activator" | "Prospector" | "Crit Build" | "Chain Lightning" | "Arcanist" | "Enricher") => boolean;
  render: () => void;
  getMinerSpeedUpgradeCost: (minerIndex: number) => number;
  getMinerRadiusUpgradeCost: (minerIndex: number) => number;
  getMinerCooldownSeconds: (minerIndex: number) => number;
  getDoubleActivationMinCost: (minerIndex: number) => number;
  getDoubleActivationMaxCost: (minerIndex: number) => number;
  getVeinFinderCost: (minerIndex: number) => number;
  getCritChanceCost: (minerIndex: number) => number;
  canUpgradeCritChance: (minerIndex: number) => boolean;
  getCritMultiplierCost: (minerIndex: number) => number;
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
  buyMetalBiasUpgrade: () => void;
  buyElectricEfficiencyUpgrade: () => void;
  buyEnchantBountifulUpgrade: () => void;
  buyEnchantBountifulMinUpgrade: () => void;
  buyEnchantBountifulMaxUpgrade: () => void;
  buyEnrichMinUpgrade: () => void;
  buyEnrichMaxUpgrade: () => void;
  buyEnrichChanceUpgrade: () => void;
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
    if (!canUpgradeCritChance(minerIndex)) return;
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

  function buyMetalBiasUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Chain Lightning")) return;
    if (!canUpgradeMetalBias(minerIndex)) return;
    const cost = getMetalBiasCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Chain Lightning") {
      data.metalBiasLevel += 1;
    }
    render();
  }

  function buyElectricEfficiencyUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Chain Lightning")) return;
    if (!canUpgradeElectricEfficiency(minerIndex)) return;
    const cost = getElectricEfficiencyCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Chain Lightning") {
      data.electricEfficiencyLevel += 1;
    }
    render();
  }

  function buyEnchantBountifulUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Arcanist")) return;
    if (!canUpgradeEnchantBountifulChance(minerIndex)) return;
    const cost = getEnchantBountifulCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Arcanist") {
      data.enchantBountifulLevel += 1;
    }
    render();
  }

  function buyEnchantBountifulMinUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Arcanist")) return;
    const cost = getEnchantBountifulMinCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Arcanist") {
      data.enchantBountifulMinLevel += 1;
    }
    render();
  }

  function buyEnchantBountifulMaxUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Arcanist")) return;
    const cost = getEnchantBountifulMaxCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Arcanist") {
      data.enchantBountifulMaxLevel += 1;
    }
    render();
  }

  function buyEnrichMinUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Enricher")) return;
    const cost = getEnrichMinCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Enricher") {
      data.enrichMinLevel += 1;
    }
    render();
  }

  function buyEnrichMaxUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Enricher")) return;
    const cost = getEnrichMaxCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Enricher") {
      data.enrichMaxLevel += 1;
    }
    render();
  }

  function buyEnrichChanceUpgrade(): void {
    const minerIndex = interactionState.selectedMinerIndex;
    if (minerIndex === null) return;
    if (!canUseClass(minerIndex, "Enricher")) return;
    if (!canUpgradeEnrichChance(minerIndex)) return;
    const cost = getEnrichChanceCost(minerIndex);
    if (!canAfford(cost)) {
      return;
    }
    state.coins -= cost;
    const data = state.units[minerIndex].specializationData;
    if (data.type === "Enricher") {
      data.enrichChanceLevel += 1;
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
    buyMetalBiasUpgrade,
    buyElectricEfficiencyUpgrade,
    buyEnchantBountifulUpgrade,
    buyEnchantBountifulMinUpgrade,
    buyEnchantBountifulMaxUpgrade,
    buyEnrichMinUpgrade,
    buyEnrichMaxUpgrade,
    buyEnrichChanceUpgrade,
  };
}

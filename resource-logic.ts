import type { GameState, OreType, ResourceConfig, UpgradeConfig, UpgradableOre } from "./game-types";
import { DEFAULT_RESOURCES } from "./resources";

interface CreateResourceLogicArgs {
  state: GameState;
  resourceLegendBody: HTMLElement | null;
  getUpgradeCost: (config: UpgradeConfig, owned: number) => number;
  round: (value: number, digits?: number) => number;
  getChanceText: (chancePercent: number) => string;
}

interface InventoryItemState {
  confirmed: number;
  pending: number;
}

interface ResourceLegendRowRefs {
  row: HTMLElement;
  name: HTMLElement;
  nameLabel: HTMLElement;
  chance: HTMLElement;
  value: HTMLElement;
  inventory: HTMLElement;
  sellButton: HTMLButtonElement;
}

const INVENTORY_ORES: OreType[] = ["sand", "coal", "copper", "iron", "silver", "gold", "amethyst", "sapphire", "emerald", "ruby", "diamond"];
const NORMAL_ORES: OreType[] = ["sand", "coal", "copper", "iron", "silver", "gold"];
const UPGRADABLE_ORES: UpgradableOre[] = INVENTORY_ORES.slice(1) as UpgradableOre[];
const GEM_ORES: UpgradableOre[] = ["amethyst", "sapphire", "emerald", "ruby", "diamond"];
const STONE_ORES: OreType[] = ["sand", "coal"];
const METAL_ORES: OreType[] = ["copper", "iron", "silver", "gold"];
type ResourceCategoryKey = "stone" | "metal" | "gemstone";

export function createResourceLogic(args: CreateResourceLogicArgs): {
  getResourceByOre: (ore: OreType) => ResourceConfig;
  getOreGenerationLevel: (ore: UpgradableOre) => number;
  setOreGenerationLevel: (ore: UpgradableOre, level: number) => void;
  getOreWeightForLevel: (ore: OreType, level: number) => number;
  getOreGenerationCost: (ore: UpgradableOre) => number;
  canIncreaseOreGeneration: (ore: UpgradableOre) => boolean;
  getOreEffectiveWeight: (ore: OreType) => number;
  rollTileType: () => OreType;
  rollTileTypeWithBoostedOre: (boostedOre: UpgradableOre, qualityMultiplier: number) => OreType;
  getTileCoinValue: (tileType: OreType) => number;
  getInventoryAmount: (ore: OreType) => number;
  addInventory: (ore: OreType, amount: number) => void;
  sellInventory: (ore: OreType, amount: number) => number;
  sellAllInventory: () => number;
  flushInventory: () => boolean;
  getOreDisplayName: (ore: OreType) => string;
  renderResourceLegend: () => void;
  getOreGenerationStatText: (ore: UpgradableOre) => string;
} {
  const { state, resourceLegendBody, getUpgradeCost, round, getChanceText } = args;

  let inventorySource = state.inventory;
  let resourceSource = state.resources;
  let legendInitialized = false;

  const legendDirtyOres = new Set<OreType>(INVENTORY_ORES);
  const legendRowRefs: Partial<Record<OreType, ResourceLegendRowRefs>> = {};
  const categorySummaryRefs: Partial<Record<ResourceCategoryKey, ResourceLegendRowRefs>> = {};
  const categorySectionRows: Partial<Record<ResourceCategoryKey, HTMLElement>> = {};
  const categorySplitOpen: Record<ResourceCategoryKey, boolean> = {
    stone: false,
    metal: false,
    gemstone: false,
  };
  const categoryDefinitions: Array<{ key: ResourceCategoryKey; label: string; ores: OreType[] }> = [
    { key: "stone", label: "Stone", ores: STONE_ORES },
    { key: "metal", label: "Metal", ores: METAL_ORES },
    { key: "gemstone", label: "Gemstone", ores: [...GEM_ORES] },
  ];

  function updateCategorySplitVisibility(): void {
    for (const category of categoryDefinitions) {
      const isOpen = categorySplitOpen[category.key];
      const sectionRow = categorySectionRows[category.key];
      if (sectionRow) {
        sectionRow.classList.toggle("hidden", !isOpen);
      }

      for (const ore of category.ores) {
        const refs = legendRowRefs[ore];
        if (refs) {
          refs.row.classList.toggle("hidden", !isOpen);
        }
      }

      const summaryRefs = categorySummaryRefs[category.key];
      if (summaryRefs) {
        summaryRefs.sellButton.textContent = isOpen ? "Split ▾" : "Split ▸";
        summaryRefs.sellButton.setAttribute("aria-expanded", String(isOpen));
        summaryRefs.sellButton.setAttribute("aria-label", isOpen ? `Collapse ${category.label.toLowerCase()} split` : `Expand ${category.label.toLowerCase()} split`);
      }
    }
  }

  function markLegendDirty(ore: OreType): void {
    legendDirtyOres.add(ore);
  }

  function markAllLegendDirty(): void {
    for (const ore of INVENTORY_ORES) {
      legendDirtyOres.add(ore);
    }
  }

  const inventoryItems: Record<OreType, InventoryItemState> = {
    ...Object.fromEntries(
      INVENTORY_ORES.map((ore) => [ore, { confirmed: Math.max(0, Math.floor(Number(inventorySource[ore]) || 0)), pending: 0 }])
    ),
  } as Record<OreType, InventoryItemState>;

  function ensureInventorySource(): void {
    if (state.inventory === inventorySource) {
      return;
    }

    inventorySource = state.inventory;
    for (const ore of INVENTORY_ORES) {
      inventoryItems[ore].confirmed = Math.max(0, Math.floor(Number(inventorySource[ore]) || 0));
      inventoryItems[ore].pending = 0;
    }
    markAllLegendDirty();
  }

  function syncOreToState(ore: OreType): void {
    inventorySource[ore] = inventoryItems[ore].confirmed;
  }

  function flushInventoryForOre(ore: OreType): boolean {
    ensureInventorySource();
    const item = inventoryItems[ore];
    if (item.pending === 0) {
      return false;
    }

    item.confirmed = Math.max(0, item.confirmed + item.pending);
    item.pending = 0;
    syncOreToState(ore);
    markLegendDirty(ore);
    return true;
  }

  function flushInventory(): boolean {
    ensureInventorySource();
    let changed = false;
    for (const ore of INVENTORY_ORES) {
      if (flushInventoryForOre(ore)) {
        changed = true;
      }
    }
    return changed;
  }

  function getOreUpgradeConfig(ore: UpgradableOre): UpgradeConfig {
    const resource = state.resources.find((entry) => entry.ore === ore);
    return {
      baseCost: resource?.baseCost || 0,
      growth: resource?.growth || 1,
    };
  }

  function getResourceByOre(ore: OreType): ResourceConfig {
    const resource = state.resources.find((entry) => entry.ore === ore);
    if (resource) {
      return resource;
    }

    const fallback = DEFAULT_RESOURCES.find((entry) => entry.ore === ore);
    if (fallback) {
      return { ...fallback };
    }

    return {
      ore,
      type: ore === "sand" || ore === "coal" ? "stone" : ore === "copper" || ore === "iron" || ore === "silver" || ore === "gold" ? "metal" : "gem",
      name: ore.charAt(0).toUpperCase() + ore.slice(1),
      weight: 0,
      value: 1,
      baseCost: 0,
      growth: 1,
      resourceLevel: 0,
    };
  }

  function getOreGenerationLevel(ore: UpgradableOre): number {
    return getResourceByOre(ore).resourceLevel;
  }

  function setOreGenerationLevel(ore: UpgradableOre, level: number): void {
    const resource = state.resources.find((entry) => entry.ore === ore);
    if (resource) {
      resource.resourceLevel = Math.max(0, level);
      markAllLegendDirty();
    }
  }

  function getOreWeightForLevel(ore: OreType, level: number): number {
    const baseWeight = getResourceByOre(ore).weight;
    if (ore === "sand") {
      return baseWeight;
    }
    if (level <= 0) {
      return 0;
    }
    return baseWeight * 1.2 ** (level - 1);
  }

  function getUnlockedBaseWeight(ore: OreType): number {
    if (ore === "sand") {
      return getResourceByOre("sand").weight;
    }

    const level = getOreGenerationLevel(ore);
    return level > 0 ? getResourceByOre(ore).weight : 0;
  }

  function getLevelForOre(ore: OreType, overrides?: Partial<Record<UpgradableOre, number>>): number {
    if (ore === "sand") {
      return 0;
    }

    const overrideLevel = overrides?.[ore as UpgradableOre];
    if (overrideLevel === undefined) {
      return getOreGenerationLevel(ore as UpgradableOre);
    }

    return Math.max(0, overrideLevel);
  }

  function getUnlockedBaseWeightForLevel(ore: OreType, level: number): number {
    if (ore === "sand") {
      return getResourceByOre("sand").weight;
    }

    return level > 0 ? getResourceByOre(ore).weight : 0;
  }

  function buildRedistributedWeightMap(overrides?: Partial<Record<UpgradableOre, number>>): Record<OreType, number> {
    const redistributed = {} as Record<OreType, number>;

    for (const ore of INVENTORY_ORES) {
      if (ore === "sand") {
        redistributed[ore] = getUnlockedBaseWeight("sand");
        continue;
      }

      redistributed[ore] = getUnlockedBaseWeightForLevel(ore, getLevelForOre(ore, overrides));
    }

    for (let index = 1; index < INVENTORY_ORES.length; index += 1) {
      const ore = INVENTORY_ORES[index];
      const level = getLevelForOre(ore, overrides);
      if (level <= 0) {
        redistributed[ore] = 0;
        continue;
      }

      const baseUnlockedWeight = getUnlockedBaseWeightForLevel(ore, level);
      const targetWeight = getOreWeightForLevel(ore, level);
      const bonusToAdd = Math.max(0, targetWeight - baseUnlockedWeight);
      if (bonusToAdd <= 0) {
        continue;
      }

      const lowerOres = INVENTORY_ORES.slice(0, index);
      const availableFromLower = lowerOres.reduce((sum, lowerOre) => sum + redistributed[lowerOre], 0);
      if (availableFromLower <= 0) {
        continue;
      }

      const transfer = Math.min(bonusToAdd, availableFromLower);
      for (const lowerOre of lowerOres) {
        const currentLowerWeight = redistributed[lowerOre];
        if (currentLowerWeight <= 0) {
          continue;
        }
        const lowerShare = currentLowerWeight / availableFromLower;
        redistributed[lowerOre] = Math.max(0, currentLowerWeight - transfer * lowerShare);
      }

      redistributed[ore] += transfer;
    }

    return redistributed;
  }

  function getOreGenerationCost(ore: UpgradableOre): number {
    return getUpgradeCost(getOreUpgradeConfig(ore), getOreGenerationLevel(ore));
  }

  function canIncreaseOreGeneration(ore: UpgradableOre): boolean {
    const currentLevel = getOreGenerationLevel(ore);
    const nextLevel = currentLevel + 1;
    const nextWeight = getOreWeightForLevel(ore, nextLevel);
    const maxSupportedWeight = buildRedistributedWeightMap({
      ...Object.fromEntries(UPGRADABLE_ORES.map((entry) => [entry, getOreGenerationLevel(entry)])),
      [ore]: Number.MAX_SAFE_INTEGER,
    })[ore];

    return nextWeight <= maxSupportedWeight;
  }

  function buildEffectiveWeightMap(overrides?: Partial<Record<UpgradableOre, number>>): Record<OreType, number> {
    const redistributed = buildRedistributedWeightMap(overrides);
    const effective = { ...redistributed };

    const gemstoneWeight = GEM_ORES.reduce((sum, ore) => sum + redistributed[ore], 0);
    if (gemstoneWeight <= 0) {
      return effective;
    }

    const equalGemShare = gemstoneWeight / GEM_ORES.length;

    for (const ore of GEM_ORES) {
      effective[ore] = equalGemShare;
    }

    return effective;
  }

  function getOreEffectiveWeight(ore: OreType): number {
    const effective = buildEffectiveWeightMap();
    return effective[ore] || 0;
  }

  function getWeightedRoll(boostedOre: UpgradableOre | null, qualityMultiplier: number): OreType {
    const effectiveWeights = buildEffectiveWeightMap();
    const gemstonePoolWeight = GEM_ORES.reduce((sum, ore) => sum + (effectiveWeights[ore] || 0), 0);
    const weights: Array<{ ore: OreType | "gemstone-pool"; weight: number }> = [
      ...NORMAL_ORES.map((ore) => ({ ore, weight: effectiveWeights[ore] || 0 })),
      { ore: "gemstone-pool", weight: gemstonePoolWeight },
    ];

    if (boostedOre) {
      if (GEM_ORES.includes(boostedOre)) {
        const poolEntry = weights.find((entry) => entry.ore === "gemstone-pool");
        if (poolEntry) {
          poolEntry.weight *= qualityMultiplier;
        }
      } else {
        const targetEntry = weights.find((entry) => entry.ore === boostedOre);
        if (targetEntry) {
          targetEntry.weight *= qualityMultiplier;
        }
      }
    }

    const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of weights) {
      roll -= entry.weight;
      if (roll <= 0) {
        if (entry.ore === "gemstone-pool") {
          const randomGemIndex = Math.floor(Math.random() * GEM_ORES.length);
          return GEM_ORES[randomGemIndex];
        }
        return entry.ore;
      }
    }

    return "sand";
  }

  function rollTileType(): OreType {
    return getWeightedRoll(null, 1);
  }

  function rollTileTypeWithBoostedOre(boostedOre: UpgradableOre, qualityMultiplier: number): OreType {
    return getWeightedRoll(boostedOre, qualityMultiplier);
  }

  function getTileCoinValue(tileType: OreType): number {
    return getResourceByOre(tileType).value || 1;
  }

  function getInventoryAmount(ore: OreType): number {
    ensureInventorySource();
    const item = inventoryItems[ore];
    return Math.max(0, item.confirmed + item.pending);
  }

  function addInventory(ore: OreType, amount: number): void {
    ensureInventorySource();
    if (amount <= 0) {
      return;
    }
    inventoryItems[ore].pending += Math.floor(amount);
    markLegendDirty(ore);
  }

  function sellInventory(ore: OreType, amount: number): number {
    ensureInventorySource();
    flushInventoryForOre(ore);
    const owned = inventoryItems[ore].confirmed;
    const toSell = Math.min(owned, Math.max(0, Math.floor(amount)));
    if (toSell <= 0) {
      return 0;
    }

    inventoryItems[ore].confirmed = owned - toSell;
    syncOreToState(ore);
    markLegendDirty(ore);
    return toSell * getTileCoinValue(ore);
  }

  function sellAllInventory(): number {
    ensureInventorySource();
    flushInventory();
    let totalCoins = 0;
    for (const ore of INVENTORY_ORES) {
      totalCoins += sellInventory(ore, inventoryItems[ore].confirmed);
    }
    return totalCoins;
  }

  function getOreDisplayName(ore: OreType): string {
    return getResourceByOre(ore).name;
  }

  function renderResourceLegend(): void {
    if (!resourceLegendBody) {
      return;
    }

    if (state.resources !== resourceSource) {
      resourceSource = state.resources;
      markAllLegendDirty();
    }

    if (!legendInitialized) {
      resourceLegendBody.innerHTML = "";

      const createLegendRow = (ore: OreType | ResourceCategoryKey, mode: "sell" | "accordion" | "none"): ResourceLegendRowRefs => {
        const row = document.createElement("p");
        row.className = "resource-legend-row";

        const nameNode = document.createElement("span");
        const nameLabel = document.createElement("span");
        const tilePreview = document.createElement("span");
        const chanceNode = document.createElement("span");
        const valueNode = document.createElement("span");
        const inventoryNode = document.createElement("span");
        const sellNode = document.createElement("span");
        const sellButton = document.createElement("button");

        nameNode.className = "resource-legend-name";
        nameLabel.className = "resource-legend-name-label";
        tilePreview.className = "resource-legend-tile map-tile";
        if (ore === "gemstone") {
          tilePreview.classList.add("resource-legend-tile--gemstone", "map-tile--diamond");
        } else if (ore === "stone") {
          tilePreview.classList.add("map-tile--coal");
        } else if (ore === "metal") {
          tilePreview.classList.add("map-tile--iron");
        } else if (ore !== "sand") {
          tilePreview.classList.add(`map-tile--${ore}`);
        }
        tilePreview.setAttribute("aria-hidden", "true");
        nameNode.append(tilePreview, nameLabel);

        sellButton.type = "button";
        sellButton.className = "resource-sell-btn";
        if (mode === "sell") {
          sellButton.dataset.ore = ore;
          sellButton.textContent = "Sell All";
        } else if (mode === "accordion") {
          sellButton.classList.add("resource-accordion-btn");
          sellButton.textContent = "Split ▸";
        } else {
          sellButton.disabled = true;
          sellButton.textContent = "-";
        }

        sellNode.appendChild(sellButton);
        row.append(nameNode, chanceNode, valueNode, inventoryNode, sellNode);
        resourceLegendBody.appendChild(row);

        return {
          row,
          name: nameNode,
          nameLabel,
          chance: chanceNode,
          value: valueNode,
          inventory: inventoryNode,
          sellButton,
        };
      };

      for (const category of categoryDefinitions) {
        const summaryRefs = createLegendRow(category.key, "accordion");
        categorySummaryRefs[category.key] = summaryRefs;
        summaryRefs.sellButton.addEventListener("click", () => {
          categorySplitOpen[category.key] = !categorySplitOpen[category.key];
          updateCategorySplitVisibility();
        });
      }

      for (const category of categoryDefinitions) {
        const sectionRow = document.createElement("p");
        sectionRow.className = "resource-legend-section-row";
        sectionRow.textContent = `${category.label} Split`;
        resourceLegendBody.appendChild(sectionRow);
        categorySectionRows[category.key] = sectionRow;

        for (const ore of category.ores) {
          legendRowRefs[ore] = createLegendRow(ore, "sell");
        }
      }

      legendInitialized = true;
      updateCategorySplitVisibility();
      markAllLegendDirty();
    }

    if (legendDirtyOres.size === 0) {
      return;
    }

    const effectiveWeights = buildEffectiveWeightMap();
    const weights = INVENTORY_ORES.map((ore) => ({ ore, weight: effectiveWeights[ore] || 0 }));
    const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0);
    for (const category of categoryDefinitions) {
      const categoryWeight = category.ores.reduce((sum, ore) => sum + (effectiveWeights[ore] || 0), 0);
      const categoryChancePercent = totalWeight > 0 ? (categoryWeight / totalWeight) * 100 : 0;
      const categoryInventory = category.ores.reduce((sum, ore) => sum + getInventoryAmount(ore), 0);

      const summaryRefs = categorySummaryRefs[category.key];
      if (summaryRefs) {
        summaryRefs.nameLabel.textContent = category.label;
        summaryRefs.chance.textContent = `${getChanceText(categoryChancePercent)}%`;
        summaryRefs.value.textContent = "-";
        summaryRefs.inventory.textContent = categoryInventory.toLocaleString();
      }

      for (const ore of category.ores) {
        const refs = legendRowRefs[ore];
        if (!refs) {
          continue;
        }

        const weight = weights.find((entry) => entry.ore === ore)?.weight || 0;
        const chancePercent = categoryWeight > 0 ? (weight / categoryWeight) * 100 : 0;

        refs.nameLabel.textContent = getOreDisplayName(ore);
        refs.chance.textContent = `${getChanceText(chancePercent)}%`;
        refs.value.textContent = getTileCoinValue(ore).toString();
        refs.inventory.textContent = getInventoryAmount(ore).toString();
        refs.sellButton.dataset.ore = ore;
      }
    }

    legendDirtyOres.clear();
  }

  function getOreGenerationStatText(ore: UpgradableOre): string {
    const currentLevel = getOreGenerationLevel(ore);
    const currentWeight = getOreWeightForLevel(ore, currentLevel);
    const nextWeight = getOreWeightForLevel(ore, currentLevel + 1);
    if (currentLevel <= 0) {
      return `Locked. Weight: 0 → ${round(nextWeight, 2).toLocaleString()} on first upgrade`;
    }
    return `Weight: ${round(currentWeight, 2).toLocaleString()} → ${round(nextWeight, 2).toLocaleString()} (+20%)`;
  }

  return {
    getResourceByOre,
    getOreGenerationLevel,
    setOreGenerationLevel,
    getOreWeightForLevel,
    getOreGenerationCost,
    canIncreaseOreGeneration,
    getOreEffectiveWeight,
    rollTileType,
    rollTileTypeWithBoostedOre,
    getTileCoinValue,
    getInventoryAmount,
    addInventory,
    sellInventory,
    sellAllInventory,
    flushInventory,
    getOreDisplayName,
    renderResourceLegend,
    getOreGenerationStatText,
  };
}

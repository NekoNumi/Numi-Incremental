import type { OreType, TileEnchantment, UpgradableOre } from "./game-types";

interface CreateTileActionsArgs {
  mapGrid: HTMLElement | null;
  addInventory: (ore: OreType, amount: number) => void;
  getTileCoinValue: (ore: OreType) => number;
  isArcanistMiner: (minerIndex: number) => boolean;
  isEnricherMiner: (minerIndex: number) => boolean;
  getCritChance: (minerIndex: number) => number;
  getCritMultiplier: (minerIndex: number) => number;
  getVeinFinderQualityMultiplier: (minerIndex: number) => number;
  getEnchantBountifulChance: (minerIndex: number) => number;
  getEnchantBountifulMinMultiplier: (minerIndex: number) => number;
  getEnchantBountifulMaxMultiplier: (minerIndex: number) => number;
  getEnrichChance: (minerIndex: number) => number;
  getEnrichMinMultiplier: (minerIndex: number) => number;
  getEnrichMaxMultiplier: (minerIndex: number) => number;
  rollTileType: () => OreType;
  rollTileTypeWithBoostedOre: (boostedOre: UpgradableOre, qualityMultiplier: number) => OreType;
  getChainReactionChance: (minerIndex: number) => number;
  getChainReactionLength: (minerIndex: number) => number;
  getChainMetalBiasChance: (minerIndex: number) => number;
  getElectricEfficiencyChance: (minerIndex: number) => number;
  render: () => void;
}

export function createTileActions(args: CreateTileActionsArgs): {
  clearTileOreClasses: (tile: HTMLElement) => void;
  getTileAriaLabel: (tileType: OreType) => string;
  applyTileType: (tile: HTMLElement, tileType: OreType) => void;
  activateTile: (tile: HTMLElement, shouldRender?: boolean, minerIndex?: number | null) => boolean;
  triggerChainReaction: (minerIndex: number, sourceTile: HTMLElement, mapSize: number) => number;
} {
  const {
    mapGrid,
    addInventory,
    getTileCoinValue,
    isArcanistMiner,
    isEnricherMiner,
    getCritChance,
    getCritMultiplier,
    getVeinFinderQualityMultiplier,
    getEnchantBountifulChance,
    getEnchantBountifulMinMultiplier,
    getEnchantBountifulMaxMultiplier,
    getEnrichChance,
    getEnrichMinMultiplier,
    getEnrichMaxMultiplier,
    rollTileType,
    rollTileTypeWithBoostedOre,
    getChainReactionChance,
    getChainReactionLength,
    getChainMetalBiasChance,
    getElectricEfficiencyChance,
    render,
  } = args;

  const METAL_ORES: OreType[] = ["copper", "iron", "silver", "gold"];

  function triggerCritSpark(tile: HTMLElement): void {
    tile.classList.remove("map-tile--crit-spark");
    void tile.offsetWidth;
    tile.classList.add("map-tile--crit-spark");
    setTimeout(() => {
      tile.classList.remove("map-tile--crit-spark");
    }, 420);
  }

  function triggerElectricEfficiencySpark(tile: HTMLElement): void {
    tile.classList.remove("map-tile--electric-spark");
    void tile.offsetWidth;
    tile.classList.add("map-tile--electric-spark");
    setTimeout(() => {
      tile.classList.remove("map-tile--electric-spark");
    }, 520);
  }

  function renderChainArc(fromTile: HTMLElement, toTile: HTMLElement): void {
    if (!mapGrid) {
      return;
    }

    const gridRect = mapGrid.getBoundingClientRect();
    const fromRect = fromTile.getBoundingClientRect();
    const toRect = toTile.getBoundingClientRect();

    const fromX = fromRect.left - gridRect.left + fromRect.width / 2;
    const fromY = fromRect.top - gridRect.top + fromRect.height / 2;
    const toX = toRect.left - gridRect.left + toRect.width / 2;
    const toY = toRect.top - gridRect.top + toRect.height / 2;

    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance <= 0) {
      return;
    }

    const angleDeg = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    const arc = document.createElement("div");
    arc.className = "chain-lightning-arc";
    arc.style.left = `${fromX}px`;
    arc.style.top = `${fromY}px`;
    arc.style.width = `${distance}px`;
    arc.style.transform = `translateY(-50%) rotate(${angleDeg}deg)`;
    mapGrid.appendChild(arc);

    setTimeout(() => {
      arc.remove();
    }, 1000);
  }

  function clearTileOreClasses(tile: HTMLElement): void {
    tile.classList.remove(
      "map-tile--coal",
      "map-tile--copper",
      "map-tile--iron",
      "map-tile--silver",
      "map-tile--gold",
      "map-tile--sapphire",
      "map-tile--ruby",
      "map-tile--emerald",
      "map-tile--diamond",
      "map-tile--amethyst"
    );
  }

  function ensureTileEnchantment(tile: HTMLElement): void {
    const enchantment = tile.dataset.tileEnchantment as TileEnchantment | undefined;
    if (!enchantment || enchantment.length === 0) {
      tile.dataset.tileEnchantment = "none";
    }
  }

  function applyTileEnchantmentClasses(tile: HTMLElement): void {
    tile.classList.remove(
      "map-tile--enchant-bountiful",
      "map-tile--enchant-enriched",
      "map-tile--enchant-strength-1",
      "map-tile--enchant-strength-2",
      "map-tile--enchant-strength-3",
      "map-tile--enchant-strength-4",
      "map-tile--enchant-strength-5"
    );

    const clampStrengthLevel = (value: number): number => {
      if (!Number.isFinite(value)) {
        return 1;
      }
      return Math.max(1, Math.min(5, Math.round(value)));
    };

    const getTileEnchantmentStrengthLevel = (): number => {
      const enchantment = (tile.dataset.tileEnchantment as TileEnchantment) || "none";
      if (enchantment === "bountiful") {
        const advantage = Number(tile.dataset.tileBountifulAdvantage);
        return clampStrengthLevel(advantage);
      }

      if (enchantment === "enriched") {
        const multiplier = Number(tile.dataset.tileEnrichMultiplier);
        return clampStrengthLevel(multiplier);
      }

      return 1;
    };

    const getTileEnchantmentOpacity = (): number => {
      const rawOpacity = Number(tile.dataset.tileEnchantmentOpacity);
      if (!Number.isFinite(rawOpacity)) {
        return 1;
      }
      return Math.max(0, Math.min(1, rawOpacity));
    };

    const enchantment = (tile.dataset.tileEnchantment as TileEnchantment) || "none";
    if (enchantment === "bountiful") {
      tile.style.setProperty("--tile-enchant-opacity", getTileEnchantmentOpacity().toFixed(4));
      tile.classList.add("map-tile--enchant-bountiful");
      tile.classList.add(`map-tile--enchant-strength-${getTileEnchantmentStrengthLevel()}`);
      return;
    }

    if (enchantment === "enriched") {
      tile.style.setProperty("--tile-enchant-opacity", getTileEnchantmentOpacity().toFixed(4));
      tile.classList.add("map-tile--enchant-enriched");
      tile.classList.add(`map-tile--enchant-strength-${getTileEnchantmentStrengthLevel()}`);
      return;
    }

    tile.style.removeProperty("--tile-enchant-opacity");
  }

  function getTileAriaLabel(tileType: OreType): string {
    switch (tileType) {
      case "coal":
        return "Coal tile";
      case "copper":
        return "Copper tile";
      case "iron":
        return "Iron tile";
      case "silver":
        return "Silver tile";
      case "gold":
        return "Gold tile";
      case "sapphire":
        return "Sapphire tile";
      case "ruby":
        return "Ruby tile";
      case "emerald":
        return "Emerald tile";
      case "diamond":
        return "Diamond tile";
      case "amethyst":
        return "Amethyst tile";
      default:
        return "Sandy tile";
    }
  }

  function applyTileType(tile: HTMLElement, tileType: OreType): void {
    ensureTileEnchantment(tile);
    tile.dataset.tileType = tileType;
    clearTileOreClasses(tile);
    applyTileEnchantmentClasses(tile);
    if (tileType !== "sand") {
      tile.classList.add(`map-tile--${tileType}`);
    }
    tile.setAttribute("aria-label", getTileAriaLabel(tileType));
  }

  function pickHigherValueOre(first: OreType, second: OreType): OreType {
    return getTileCoinValue(second) > getTileCoinValue(first) ? second : first;
  }

  function rollRespawnTileType(minedOre: UpgradableOre | null, qualityMultiplier: number, bountifulAdvantage: number): OreType {
    const rollOnce = (): OreType => {
      if (minedOre && qualityMultiplier > 1) {
        return rollTileTypeWithBoostedOre(minedOre, qualityMultiplier);
      }
      return rollTileType();
    };

    const firstRoll = rollOnce();
    if (bountifulAdvantage <= 1) {
      return firstRoll;
    }

    const fullRolls = Math.floor(bountifulAdvantage);
    const remainderRollChance = bountifulAdvantage - fullRolls;
    const totalRolls = fullRolls + (Math.random() < remainderRollChance ? 1 : 0);

    let bestRoll = firstRoll;
    for (let roll = 1; roll < Math.max(2, totalRolls); roll += 1) {
      bestRoll = pickHigherValueOre(bestRoll, rollOnce());
    }

    return bestRoll;
  }

  function activateTile(tile: HTMLElement, shouldRender: boolean = true, minerIndex: number | null = null): boolean {
    if (!(tile instanceof HTMLElement) || tile.classList.contains("map-tile--cooldown")) {
      return false;
    }

    ensureTileEnchantment(tile);

    if (minerIndex !== null && isArcanistMiner(minerIndex)) {
      const enchantment = tile.dataset.tileEnchantment as TileEnchantment;
      const enchantChance = getEnchantBountifulChance(minerIndex);
      if (enchantment === "none" && Math.random() < enchantChance) {
        const min = getEnchantBountifulMinMultiplier(minerIndex);
        const max = Math.max(min, getEnchantBountifulMaxMultiplier(minerIndex));
        const bountifulAdvantage = min + Math.random() * (max - min);
        tile.dataset.tileEnchantment = "bountiful";
        tile.dataset.tileEnchantmentOpacity = enchantChance.toFixed(4);
        tile.dataset.tileBountifulAdvantage = bountifulAdvantage.toFixed(4);
        applyTileEnchantmentClasses(tile);
        if (shouldRender) {
          render();
        }
        return true;
      }
      return false;
    }

    if (minerIndex !== null && isEnricherMiner(minerIndex)) {
      const enchantment = tile.dataset.tileEnchantment as TileEnchantment;
      const enchantChance = getEnrichChance(minerIndex);
      if (enchantment === "none" && Math.random() < enchantChance) {
        const min = getEnrichMinMultiplier(minerIndex);
        const max = Math.max(min, getEnrichMaxMultiplier(minerIndex));
        const enrichMultiplier = min + Math.random() * (max - min);
        tile.dataset.tileEnchantment = "enriched";
        tile.dataset.tileEnchantmentOpacity = enchantChance.toFixed(4);
        tile.dataset.tileEnrichMultiplier = enrichMultiplier.toFixed(4);
        applyTileEnchantmentClasses(tile);
        if (shouldRender) {
          render();
        }
        return true;
      }
      return false;
    }

    const tileType = (tile.dataset.tileType as OreType) || "sand";
    const isCrit = minerIndex !== null && Math.random() < getCritChance(minerIndex);
    const critMultiplier = minerIndex !== null ? getCritMultiplier(minerIndex) : 1;
    const isEnriched = tile.dataset.tileEnchantment === "enriched";
    const enrichMultiplier = isEnriched ? Math.max(1, Number(tile.dataset.tileEnrichMultiplier) || 1) : 1;

    let quantity = enrichMultiplier;
    if (isCrit) {
      triggerCritSpark(tile);
      const bonusFromMultiplier = Math.max(0, critMultiplier - 1);
      const guaranteedBonus = Math.floor(bonusFromMultiplier);
      const remainderBonus = bonusFromMultiplier - guaranteedBonus;
      const rolledBonus = Math.random() < remainderBonus ? 1 : 0;
      quantity *= 1 + guaranteedBonus + rolledBonus;
    }

    const guaranteedQuantity = Math.floor(quantity);
    const remainderQuantity = quantity - guaranteedQuantity;
    quantity = guaranteedQuantity + (Math.random() < remainderQuantity ? 1 : 0);
    quantity = Math.max(1, quantity);

    addInventory(tileType, quantity);

    if (isEnriched) {
      tile.dataset.tileEnchantment = "none";
      delete tile.dataset.tileEnchantmentOpacity;
      delete tile.dataset.tileEnrichMultiplier;
      applyTileEnchantmentClasses(tile);
    }

    if (minerIndex !== null && Math.random() < getEnchantBountifulChance(minerIndex)) {
      tile.dataset.tileEnchantment = "bountiful";
      applyTileEnchantmentClasses(tile);
    }

    tile.classList.add("map-tile--cooldown");
    tile.dataset.tileType = "sand";
    clearTileOreClasses(tile);

    const minedOre = tileType === "sand" ? null : (tileType as UpgradableOre);
    const qualityMultiplier = minerIndex === null ? 1 : getVeinFinderQualityMultiplier(minerIndex);
    const isBountiful = tile.dataset.tileEnchantment === "bountiful";
    const bountifulAdvantage = isBountiful ? Math.max(1, Number(tile.dataset.tileBountifulAdvantage) || 2) : 1;

    setTimeout(() => {
      tile.classList.remove("map-tile--cooldown");
      const respawnTileType = rollRespawnTileType(minedOre, qualityMultiplier, bountifulAdvantage);

      if (isBountiful) {
        tile.dataset.tileEnchantment = "none";
        delete tile.dataset.tileEnchantmentOpacity;
        delete tile.dataset.tileBountifulAdvantage;
      }

      applyTileType(tile, respawnTileType);
    }, 1000);

    if (shouldRender) {
      render();
    }
    return true;
  }

  function getAdjacentTileIndices(tileIndex: number, mapSize: number): number[] {
    const column = tileIndex % mapSize;
    const row = Math.floor(tileIndex / mapSize);
    const indices: number[] = [];

    if (row > 0) indices.push(tileIndex - mapSize);
    if (row < mapSize - 1) indices.push(tileIndex + mapSize);
    if (column > 0) indices.push(tileIndex - 1);
    if (column < mapSize - 1) indices.push(tileIndex + 1);

    return indices;
  }

  function triggerChainReaction(minerIndex: number, sourceTile: HTMLElement, mapSize: number): number {
    if (!mapGrid || Math.random() >= getChainReactionChance(minerIndex)) {
      return 0;
    }

    let triggered = 0;
    let currentTile = sourceTile;
    let remainingSteps = getChainReactionLength(minerIndex);
    const usedIndices = new Set<number>();
    const sourceIndex = Number(sourceTile.dataset.tileIndex);
    if (Number.isInteger(sourceIndex)) {
      usedIndices.add(sourceIndex);
    }

    while (remainingSteps > 0) {
      const currentIndex = Number(currentTile.dataset.tileIndex);
      if (!Number.isInteger(currentIndex)) {
        break;
      }

      const adjacentTiles = getAdjacentTileIndices(currentIndex, mapSize)
        .map((index) => mapGrid.querySelector(`.map-tile[data-tile-index="${index}"]`) as HTMLElement | null)
        .filter(
          (tile): tile is HTMLElement =>
            tile instanceof HTMLElement &&
            !tile.classList.contains("map-tile--cooldown") &&
            !usedIndices.has(Number(tile.dataset.tileIndex))
        );

      if (adjacentTiles.length === 0) {
        break;
      }

      const metalBiasChance = getChainMetalBiasChance(minerIndex);
      let candidateTiles = adjacentTiles;
      if (metalBiasChance > 0) {
        const metalTiles = adjacentTiles.filter((tile) => {
          const tileType = (tile.dataset.tileType as OreType) || "sand";
          return METAL_ORES.includes(tileType);
        });
        if (metalTiles.length > 0 && Math.random() < metalBiasChance) {
          candidateTiles = metalTiles;
        }
      }

      const nextTile = candidateTiles[Math.floor(Math.random() * candidateTiles.length)];
      const chainedTileType = (nextTile.dataset.tileType as OreType) || "sand";
      const nextIndex = Number(nextTile.dataset.tileIndex);
      if (Number.isInteger(nextIndex)) {
        usedIndices.add(nextIndex);
      }

      if (!activateTile(nextTile, false, minerIndex)) {
        break;
      }

      renderChainArc(currentTile, nextTile);

      triggered += 1;
      currentTile = nextTile;
      if (METAL_ORES.includes(chainedTileType) && Math.random() < getElectricEfficiencyChance(minerIndex)) {
        triggerElectricEfficiencySpark(nextTile);
        remainingSteps += 1;
      }
      remainingSteps -= 1;
    }

    return triggered;
  }

  return {
    clearTileOreClasses,
    getTileAriaLabel,
    applyTileType,
    activateTile,
    triggerChainReaction,
  };
}

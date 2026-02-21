import type { OreType, TileEnchantment, UpgradableOre } from "./game-types";

interface CreateTileActionsArgs {
  mapGrid: HTMLElement | null;
  addInventory: (ore: OreType, amount: number) => void;
  getTileCoinValue: (ore: OreType) => number;
  isArcanistMiner: (minerIndex: number) => boolean;
  getCritChance: (minerIndex: number) => number;
  getCritMultiplier: (minerIndex: number) => number;
  getVeinFinderQualityMultiplier: (minerIndex: number) => number;
  getEnchantBountifulChance: (minerIndex: number) => number;
  rollTileType: () => OreType;
  rollTileTypeWithBoostedOre: (boostedOre: UpgradableOre, qualityMultiplier: number) => OreType;
  getChainReactionChance: (minerIndex: number) => number;
  getChainReactionLength: (minerIndex: number) => number;
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
    getCritChance,
    getCritMultiplier,
    getVeinFinderQualityMultiplier,
    getEnchantBountifulChance,
    rollTileType,
    rollTileTypeWithBoostedOre,
    getChainReactionChance,
    getChainReactionLength,
    render,
  } = args;

  function clearTileOreClasses(tile: HTMLElement): void {
    tile.classList.remove("map-tile--coal", "map-tile--copper", "map-tile--iron", "map-tile--silver", "map-tile--gold");
  }

  function ensureTileEnchantment(tile: HTMLElement): void {
    const enchantment = tile.dataset.tileEnchantment as TileEnchantment | undefined;
    if (!enchantment || enchantment.length === 0) {
      tile.dataset.tileEnchantment = "none";
    }
  }

  function applyTileEnchantmentClasses(tile: HTMLElement): void {
    tile.classList.remove("map-tile--enchant-bountiful");

    const enchantment = (tile.dataset.tileEnchantment as TileEnchantment) || "none";
    if (enchantment === "bountiful") {
      tile.classList.add("map-tile--enchant-bountiful");
    }
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

  function rollRespawnTileType(minedOre: UpgradableOre | null, qualityMultiplier: number, isBountiful: boolean): OreType {
    const rollOnce = (): OreType => {
      if (minedOre && qualityMultiplier > 1) {
        return rollTileTypeWithBoostedOre(minedOre, qualityMultiplier);
      }
      return rollTileType();
    };

    const firstRoll = rollOnce();
    if (!isBountiful) {
      return firstRoll;
    }

    const secondRoll = rollOnce();
    return pickHigherValueOre(firstRoll, secondRoll);
  }

  function activateTile(tile: HTMLElement, shouldRender: boolean = true, minerIndex: number | null = null): boolean {
    if (!(tile instanceof HTMLElement) || tile.classList.contains("map-tile--cooldown")) {
      return false;
    }

    ensureTileEnchantment(tile);

    if (minerIndex !== null && isArcanistMiner(minerIndex)) {
      const enchantment = tile.dataset.tileEnchantment as TileEnchantment;
      if (enchantment === "none" && Math.random() < getEnchantBountifulChance(minerIndex)) {
        tile.dataset.tileEnchantment = "bountiful";
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

    let quantity = 1;
    if (isCrit) {
      const bonusFromMultiplier = Math.max(0, critMultiplier - 1);
      const guaranteedBonus = Math.floor(bonusFromMultiplier);
      const remainderBonus = bonusFromMultiplier - guaranteedBonus;
      const rolledBonus = Math.random() < remainderBonus ? 1 : 0;
      quantity = 1 + guaranteedBonus + rolledBonus;
    }
    addInventory(tileType, quantity);

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

    setTimeout(() => {
      tile.classList.remove("map-tile--cooldown");
      const respawnTileType = rollRespawnTileType(minedOre, qualityMultiplier, isBountiful);

      if (isBountiful) {
        tile.dataset.tileEnchantment = "none";
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

      const nextTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
      const nextIndex = Number(nextTile.dataset.tileIndex);
      if (Number.isInteger(nextIndex)) {
        usedIndices.add(nextIndex);
      }

      if (!activateTile(nextTile, false, minerIndex)) {
        break;
      }

      triggered += 1;
      currentTile = nextTile;
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

import type { OreType, UpgradableOre } from "./game-types";

interface CreateTileActionsArgs {
  mapGrid: HTMLElement | null;
  addCoins: (amount: number) => void;
  getTileCoinValue: (tileType: OreType) => number;
  getCritChance: (minerIndex: number) => number;
  getCritMultiplier: (minerIndex: number) => number;
  getVeinFinderQualityMultiplier: (minerIndex: number) => number;
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
    addCoins,
    getTileCoinValue,
    getCritChance,
    getCritMultiplier,
    getVeinFinderQualityMultiplier,
    rollTileType,
    rollTileTypeWithBoostedOre,
    getChainReactionChance,
    getChainReactionLength,
    render,
  } = args;

  function clearTileOreClasses(tile: HTMLElement): void {
    tile.classList.remove("map-tile--coal", "map-tile--copper", "map-tile--iron", "map-tile--silver", "map-tile--gold");
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
    tile.dataset.tileType = tileType;
    clearTileOreClasses(tile);
    if (tileType !== "sand") {
      tile.classList.add(`map-tile--${tileType}`);
    }
    tile.setAttribute("aria-label", getTileAriaLabel(tileType));
  }

  function activateTile(tile: HTMLElement, shouldRender: boolean = true, minerIndex: number | null = null): boolean {
    if (!(tile instanceof HTMLElement) || tile.classList.contains("map-tile--cooldown")) {
      return false;
    }

    const tileType = (tile.dataset.tileType as OreType) || "sand";
    let payout = getTileCoinValue(tileType);
    if (minerIndex !== null && Math.random() < getCritChance(minerIndex)) {
      payout *= getCritMultiplier(minerIndex);
    }
    addCoins(payout);

    tile.classList.add("map-tile--cooldown");
    tile.dataset.tileType = "sand";
    clearTileOreClasses(tile);

    const minedOre = tileType === "sand" ? null : (tileType as UpgradableOre);
    const qualityMultiplier = minerIndex === null ? 1 : getVeinFinderQualityMultiplier(minerIndex);

    setTimeout(() => {
      tile.classList.remove("map-tile--cooldown");
      if (minedOre && qualityMultiplier > 1) {
        applyTileType(tile, rollTileTypeWithBoostedOre(minedOre, qualityMultiplier));
      } else {
        applyTileType(tile, rollTileType());
      }
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

import type { ResourceConfig, ResourceInventory } from "./game-types";

export const DEFAULT_RESOURCES: ResourceConfig[] = [
  { ore: "sand", name: "Sand", weight: 9200, value: 1, baseCost: 0, growth: 1, resourceLevel: 0 },
  { ore: "coal", name: "Coal", weight: 600, value: 3, baseCost: 75, growth: 1.25, resourceLevel: 0 },
  { ore: "copper", name: "Copper", weight: 140, value: 10, baseCost: 120, growth: 1.28, resourceLevel: 0 },
  { ore: "iron", name: "Iron", weight: 45, value: 25, baseCost: 220, growth: 1.31, resourceLevel: 0 },
  { ore: "silver", name: "Silver", weight: 12, value: 66, baseCost: 420, growth: 1.34, resourceLevel: 0 },
  { ore: "gold", name: "Gold", weight: 3, value: 200, baseCost: 800, growth: 1.38, resourceLevel: 0 },
];

export function createDefaultResources(): ResourceConfig[] {
  return DEFAULT_RESOURCES.map((resource) => ({ ...resource }));
}

export function createEmptyInventory(): ResourceInventory {
  return {
    sand: 0,
    coal: 0,
    copper: 0,
    iron: 0,
    silver: 0,
    gold: 0,
  };
}

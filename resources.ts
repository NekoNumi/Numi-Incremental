import type { ResourceConfig, ResourceInventory } from "./game-types";

export const DEFAULT_RESOURCES: ResourceConfig[] = [
  { ore: "sand", type: "stone", name: "Sand", weight: 9200, value: 1, baseCost: 0, growth: 1, resourceLevel: 0 },
  { ore: "coal", type: "stone", name: "Coal", weight: 600, value: 3, baseCost: 75, growth: 1.25, resourceLevel: 0 },
  { ore: "copper", type: "metal", name: "Copper", weight: 140, value: 10, baseCost: 113, growth: 1.25, resourceLevel: 0 },
  { ore: "iron", type: "metal", name: "Iron", weight: 45, value: 25, baseCost: 170, growth: 1.25, resourceLevel: 0 },
  { ore: "silver", type: "metal", name: "Silver", weight: 12, value: 66, baseCost: 255, growth: 1.25, resourceLevel: 0 },
  { ore: "gold", type: "metal", name: "Gold", weight: 3, value: 200, baseCost: 383, growth: 1.25, resourceLevel: 0 },
  { ore: "amethyst", type: "gem", name: "Amethyst", weight: 0.402, value: 500, baseCost: 575, growth: 1.25, resourceLevel: 0 },
  { ore: "sapphire", type: "gem", name: "Sapphire", weight: 0.402, value: 600, baseCost: 863, growth: 1.25, resourceLevel: 0 },
  { ore: "emerald", type: "gem", name: "Emerald", weight: 0.402, value: 700, baseCost: 1295, growth: 1.25, resourceLevel: 0 },
  { ore: "ruby", type: "gem", name: "Ruby", weight: 0.402, value: 800, baseCost: 1943, growth: 1.25, resourceLevel: 0 },
  { ore: "diamond", type: "gem", name: "Diamond", weight: 0.402, value: 900, baseCost: 2915, growth: 1.25, resourceLevel: 0 },
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
    sapphire: 0,
    ruby: 0,
    emerald: 0,
    diamond: 0,
    amethyst: 0,
  };
}

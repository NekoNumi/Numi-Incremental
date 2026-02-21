export type ResourceType = "stone" | "metal" | "gem";
export type OreType = "sand" | "coal" | "copper" | "iron" | "silver" | "gold" | "sapphire" | "ruby" | "emerald" | "diamond" | "amethyst";
export type UpgradableOre = Exclude<OreType, "sand">;
export type TileEnchantment = "none" | "bountiful" | "enriched";

export type UnitSpecialization = "Worker" | "Crit Build" | "Chain Lightning" | "Prospector" | "Multi Activator" | "Arcanist" | "Enricher" | "Foreman";
export type MinerTargeting = "random" | "high-quality" | "low-quality";

export interface Unit {
  speedLevel: number;
  radiusLevel: number;
  specializationUnlocked: boolean;
  specialization: UnitSpecialization;
  targeting: MinerTargeting;
  specializationData: UnitSpecializationData;
}

export type UnitSpecializationData =
  | { type: "Worker" }
  | { type: "Crit Build"; critChanceLevel: number; critMultiplierLevel: number }
  | {
      type: "Chain Lightning";
      chainReactionLevel: number;
      chainReactionChanceLevel: number;
      metalBiasLevel: number;
      electricEfficiencyLevel: number;
    }
  | { type: "Foreman"; overtimeLevel: number }
  | { type: "Prospector"; veinFinderLevel: number }
  | { type: "Multi Activator"; multiActivationMinLevel: number; multiActivationMaxLevel: number }
  | { type: "Arcanist"; enchantBountifulLevel: number; enchantBountifulMinLevel: number; enchantBountifulMaxLevel: number }
  | { type: "Enricher"; enrichMinLevel: number; enrichMaxLevel: number; enrichChanceLevel: number };

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface UpgradeConfig {
  baseCost: number;
  growth: number;
  cappedMax?: boolean;
  bonusClicksPerSecond?: number;
  triggerIntervalSeconds?: number;
  radiusBonusPerLevel?: number;
}

export interface ResourceConfig {
  ore: OreType;
  type: ResourceType;
  name: string;
  weight: number;
  value: number;
  baseCost: number;
  growth: number;
  resourceLevel: number;
}

export type ResourceInventory = Record<OreType, number>;

export interface GameState {
  coins: number;
  activePlaySeconds: number;
  autoSellEnabled: boolean;
  leftHandedMode: boolean;
  idleMinerOwned: number;
  mapExpansions: number;
  resources: ResourceConfig[];
  inventory: ResourceInventory;
  lastTick: number;
  lastRenderedMapSize: number;
  idleMinerCooldowns: number[];
  idleMinerPositions: (Position | null)[];
  units: Unit[];
}

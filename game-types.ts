export type OreType = "sand" | "coal" | "copper" | "iron" | "silver" | "gold";
export type UpgradableOre = Exclude<OreType, "sand">;

export type UnitSpecialization = "Worker" | "Crit Build" | "Chain Lightning" | "Prospector" | "Multi Activator";
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
  | { type: "Chain Lightning"; chainReactionLevel: number; chainReactionChanceLevel: number }
  | { type: "Prospector"; veinFinderLevel: number }
  | { type: "Multi Activator"; multiActivationMinLevel: number; multiActivationMaxLevel: number };

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
  bonusClicksPerSecond?: number;
  triggerIntervalSeconds?: number;
  radiusMultiplierPerLevel?: number;
}

export interface ResourceConfig {
  ore: OreType;
  name: string;
  weight: number;
  value: number;
  baseCost: number;
  growth: number;
  resourceLevel: number;
}

export interface GameState {
  coins: number;
  idleMinerOwned: number;
  mapExpansions: number;
  resources: ResourceConfig[];
  lastTick: number;
  lastRenderedMapSize: number;
  idleMinerCooldowns: number[];
  idleMinerPositions: (Position | null)[];
  units: Unit[];
}

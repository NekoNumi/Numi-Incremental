import type { GameState, MinerTargeting, ResourceConfig } from "./game-types";
import { createDefaultResources, createEmptyInventory } from "./resources";
import { buildSpecializationData, getDefaultSpecializationData, normalizeSpecialization } from "./unit-specialization";

interface LoadOutcome {
  awayCoins: number;
  hasSave: boolean;
  invalid: boolean;
}

export function saveGameState(saveKey: string, state: GameState, storage: Storage = localStorage): void {
  storage.setItem(
    saveKey,
    JSON.stringify({
      coins: state.coins,
      activePlaySeconds: state.activePlaySeconds,
      autoSellEnabled: state.autoSellEnabled,
      leftHandedMode: state.leftHandedMode,
      idleMinerOwned: state.idleMinerOwned,
      idleMinerCooldowns: state.idleMinerCooldowns,
      idleMinerPositions: state.idleMinerPositions,
      units: state.units,
      mapExpansions: state.mapExpansions,
      resources: state.resources,
      inventory: state.inventory,
      savedAt: Date.now(),
    })
  );
}

export function clearSavedGame(saveKey: string, storage: Storage = localStorage): void {
  storage.removeItem(saveKey);
}

export function loadGameState(
  saveKey: string,
  state: GameState,
  syncIdleMinerState: () => void,
  getCoinsPerSecond: () => number,
  round: (value: number, digits?: number) => number,
  storage: Storage = localStorage
): LoadOutcome {
  const raw = storage.getItem(saveKey);
  if (!raw) {
    return { awayCoins: 0, hasSave: false, invalid: false };
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    state.coins = Number(parsed.coins) || 0;
    state.activePlaySeconds = Math.max(0, Number(parsed.activePlaySeconds) || 0);
    state.autoSellEnabled = Boolean(parsed.autoSellEnabled);
    state.leftHandedMode = Boolean(parsed.leftHandedMode);
    state.idleMinerOwned = Number(parsed.idleMinerOwned) || 0;

    state.idleMinerCooldowns = Array.isArray(parsed.idleMinerCooldowns)
      ? parsed.idleMinerCooldowns.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value >= 0)
      : [];

    state.idleMinerPositions = Array.isArray(parsed.idleMinerPositions)
      ? parsed.idleMinerPositions
          .map((position: unknown) => {
            if (!position || typeof position !== "object") {
              return null;
            }
            const x = Number((position as Record<string, unknown>).x);
            const y = Number((position as Record<string, unknown>).y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) {
              return null;
            }
            return { x, y };
          })
          .filter((position) => position !== null)
      : [];

    const rawUnits = Array.isArray(parsed.units) ? parsed.units : [];

    state.units = Array.isArray(rawUnits)
      ? rawUnits
          .map((entry: unknown) => {
            const unit = entry as Record<string, unknown>;
            const specialization = normalizeSpecialization(unit.specialization);
            return {
              speedLevel: Number(unit?.speedLevel) || 0,
              radiusLevel: Number(unit?.radiusLevel) || 0,
              specializationUnlocked: Boolean(unit?.specializationUnlocked),
              specialization,
              targeting: (unit?.targeting as MinerTargeting) || "random",
              specializationData: buildSpecializationData(
                ((unit?.specializationData as Record<string, unknown> | undefined) || {}) as Record<string, unknown>,
                specialization
              ),
            };
          })
          .filter((unit) => unit.speedLevel >= 0 && unit.radiusLevel >= 0)
      : [];

    if (state.units.length === 0 && state.idleMinerOwned > 0) {
      for (let index = 0; index < state.idleMinerOwned; index += 1) {
        state.units.push({
          speedLevel: 0,
          radiusLevel: 0,
          specializationUnlocked: false,
          specialization: "Worker",
          targeting: "random",
          specializationData: getDefaultSpecializationData("Worker"),
        });
      }
    }

    state.mapExpansions = Number(parsed.mapExpansions) || 0;
    state.resources = createDefaultResources();
    state.inventory = createEmptyInventory();
    if (Array.isArray(parsed.resources)) {
      for (const entry of parsed.resources) {
        const resource = entry as Partial<ResourceConfig>;
        if (!resource.ore) {
          continue;
        }
        const existing = state.resources.find((item) => item.ore === resource.ore);
        if (!existing) {
          continue;
        }
        existing.resourceLevel = Math.max(0, Number(resource.resourceLevel) || 0);
      }
    }

    const parsedInventory = parsed.inventory as Record<string, unknown> | undefined;
    if (parsedInventory && typeof parsedInventory === "object") {
      state.inventory.sand = Math.max(0, Number(parsedInventory.sand) || 0);
      state.inventory.coal = Math.max(0, Number(parsedInventory.coal) || 0);
      state.inventory.copper = Math.max(0, Number(parsedInventory.copper) || 0);
      state.inventory.iron = Math.max(0, Number(parsedInventory.iron) || 0);
      state.inventory.silver = Math.max(0, Number(parsedInventory.silver) || 0);
      state.inventory.gold = Math.max(0, Number(parsedInventory.gold) || 0);
      state.inventory.sapphire = Math.max(0, Number(parsedInventory.sapphire) || 0);
      state.inventory.ruby = Math.max(0, Number(parsedInventory.ruby) || 0);
      state.inventory.emerald = Math.max(0, Number(parsedInventory.emerald) || 0);
      state.inventory.diamond = Math.max(0, Number(parsedInventory.diamond) || 0);
      state.inventory.amethyst = Math.max(0, Number(parsedInventory.amethyst) || 0);
    }

    syncIdleMinerState();

    const now = Date.now();
    const savedAt = Number(parsed.savedAt) || now;
    const secondsAway = Math.min((now - savedAt) / 1000, 8 * 60 * 60);
    const awayCoins = round(getCoinsPerSecond() * secondsAway, 0);
    state.coins += awayCoins;

    return { awayCoins, hasSave: true, invalid: false };
  } catch {
    return { awayCoins: 0, hasSave: true, invalid: true };
  }
}

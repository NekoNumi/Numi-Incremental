import type { UnitSpecialization, UnitSpecializationData } from "./game-types";

export function getDefaultSpecializationData(specialization: UnitSpecialization): UnitSpecializationData {
  switch (specialization) {
    case "Crit Build":
      return { type: specialization, critChanceLevel: 0, critMultiplierLevel: 0 };
    case "Chain Lightning":
      return { type: specialization, chainReactionLevel: 0, chainReactionChanceLevel: 0 };
    case "Prospector":
      return { type: specialization, veinFinderLevel: 0 };
    case "Multi Activator":
      return { type: specialization, multiActivationMinLevel: 0, multiActivationMaxLevel: 0 };
    default:
      return { type: "Worker" };
  }
}

export function normalizeSpecialization(value: unknown): UnitSpecialization {
  switch (value) {
    case "Prospector":
      return "Prospector";
    case "Crit Build":
      return "Crit Build";
    case "Chain Lightning":
      return "Chain Lightning";
    case "Multi Activator":
      return "Multi Activator";
    default:
      return "Worker";
  }
}

export function buildSpecializationData(raw: Record<string, unknown>, specialization: UnitSpecialization): UnitSpecializationData {
  switch (specialization) {
    case "Crit Build":
      return {
        type: "Crit Build",
        critChanceLevel: Number(raw.critChanceLevel) || 0,
        critMultiplierLevel: Number(raw.critMultiplierLevel) || 0,
      };
    case "Chain Lightning":
      return {
        type: "Chain Lightning",
        chainReactionLevel: Number(raw.chainReactionLevel) || 0,
        chainReactionChanceLevel: Number(raw.chainReactionChanceLevel) || 0,
      };
    case "Prospector":
      return {
        type: "Prospector",
        veinFinderLevel: Number(raw.veinFinderLevel) || 0,
      };
    case "Multi Activator":
      return {
        type: "Multi Activator",
        multiActivationMinLevel: Number(raw.multiActivationMinLevel) || 0,
        multiActivationMaxLevel: Number(raw.multiActivationMaxLevel) || 0,
      };
    default:
      return { type: "Worker" };
  }
}

export function getSpecializationLabel(value: UnitSpecialization): string {
  switch (value) {
    case "Prospector":
      return "🧭 Prospector";
    case "Crit Build":
      return "🎯 Crit Build";
    case "Chain Lightning":
      return "Chain Lightning";
    case "Multi Activator":
      return "⏩ Multi Activator";
    default:
      return "Worker";
  }
}

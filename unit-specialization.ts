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
    case "Arcanist":
      return { type: specialization, enchantBountifulLevel: 0, enchantBountifulMinLevel: 0, enchantBountifulMaxLevel: 0 };
    case "Enricher":
      return { type: specialization, enrichMinLevel: 0, enrichMaxLevel: 0, enrichChanceLevel: 0 };
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
    case "Arcanist":
      return "Arcanist";
    case "Enricher":
      return "Enricher";
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
    case "Arcanist":
      return {
        type: "Arcanist",
        enchantBountifulLevel: Number(raw.enchantBountifulLevel) || 0,
        enchantBountifulMinLevel: Number(raw.enchantBountifulMinLevel) || 0,
        enchantBountifulMaxLevel: Number(raw.enchantBountifulMaxLevel) || 0,
      };
    case "Enricher":
      return {
        type: "Enricher",
        enrichMinLevel: Number(raw.enrichMinLevel) || 0,
        enrichMaxLevel: Number(raw.enrichMaxLevel) || 0,
        enrichChanceLevel: Number(raw.enrichChanceLevel) || 0,
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
    case "Arcanist":
      return "✨ Arcanist";
    case "Enricher":
      return "💜 Enricher";
    default:
      return "Worker";
  }
}

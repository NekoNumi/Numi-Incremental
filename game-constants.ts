export const SAVE_KEY = "numis-idle-save-v1";
export const MOBILE_BREAKPOINT_PX = 860;
export const MOBILE_MAX_MAP_SCALE = 1.8;

const BASE_TILE_SIZE = 38;
const BASE_TILE_GAP = 6;
const BASE_MINER_RADIUS = 22.5;

const MIN_MAP_SCALE = 0.42;

function getMapScale(): number {
	if (typeof window === "undefined") {
		return 1;
	}

	const shortestViewportSide = Math.min(window.innerWidth, window.innerHeight);
	if (shortestViewportSide >= 900) {
		return 1;
	}

	return Math.max(0.72, shortestViewportSide / 900);
}

export const VIEWPORT_MAP_SCALE = getMapScale();

export let MAP_SCALE = VIEWPORT_MAP_SCALE;

export let TILE_SIZE_PX = Math.round(BASE_TILE_SIZE * MAP_SCALE);
export let TILE_GAP_PX = Math.max(4, Math.round(BASE_TILE_GAP * MAP_SCALE));
export let BASE_MINER_EFFECT_RADIUS_PX = BASE_MINER_RADIUS * MAP_SCALE;

export function applyMapScale(scale: number, options?: { maxScale?: number }): void {
	const maxScale = options?.maxScale ?? VIEWPORT_MAP_SCALE;
	const clampedScale = Math.max(MIN_MAP_SCALE, Math.min(maxScale, scale));
	MAP_SCALE = clampedScale;
	TILE_SIZE_PX = Math.round(BASE_TILE_SIZE * MAP_SCALE);
	TILE_GAP_PX = Math.max(2, Math.round(BASE_TILE_GAP * MAP_SCALE));
	BASE_MINER_EFFECT_RADIUS_PX = BASE_MINER_RADIUS * MAP_SCALE;
}

export function getMapPixelSizeAtScale(mapSize: number, scale: number): number {
	const tileSize = Math.round(BASE_TILE_SIZE * scale);
	const tileGap = Math.max(2, Math.round(BASE_TILE_GAP * scale));
	return mapSize * tileSize + (mapSize - 1) * tileGap;
}

export const MIN_TILE_COVERAGE_IN_RADIUS = 0.3;
export const SPECIALIZATION_COST = 250;
export const MAX_MAP_SIZE = 15;

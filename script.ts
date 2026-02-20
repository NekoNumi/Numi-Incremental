// Constants
const SAVE_KEY = "numis-idle-save-v1";
const TILE_SIZE_PX = 38;
const TILE_GAP_PX = 6;
const BASE_MINER_EFFECT_RADIUS_PX = 22.5;
const MIN_TILE_COVERAGE_IN_RADIUS = 0.3;

// Type definitions
interface MinerUpgrade {
  speedLevel: number;
  radiusLevel: number;
}

interface Position {
  x: number;
  y: number;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface UpgradeConfig {
  baseCost: number;
  growth: number;
  bonusClicksPerSecond?: number;
  triggerIntervalSeconds?: number;
  areaMultiplierPerLevel?: number;
}

interface GameState {
  coins: number;
  idleMinerOwned: number;
  mapExpansions: number;
  coalGenerationLevel: number;
  lastTick: number;
  lastRenderedMapSize: number;
  idleMinerCooldowns: number[];
  idleMinerPositions: (Position | null)[];
  idleMinerUpgrades: MinerUpgrade[];
}

interface InteractionState {
  activeMinerIndex: number | null;
  selectedMinerIndex: number | null;
  repositionMode: boolean;
  placementMode: boolean;
}

interface UIElements {
  coins: HTMLElement | null;
  perSecond: HTMLElement | null;
  idleMinerCost: HTMLElement | null;
  idleMinerOwned: HTMLElement | null;
  settingsToggle: HTMLElement | null;
  settingsModal: HTMLElement | null;
  buyIdleMiner: HTMLButtonElement | null;
  save: HTMLButtonElement | null;
  reset: HTMLButtonElement | null;
  mapEnvironment: HTMLElement | null;
  mapSize: HTMLElement | null;
  mapGrid: HTMLElement | null;
  minerRing: HTMLElement | null;
  mapExpandCost: HTMLElement | null;
  mapExpansions: HTMLElement | null;
  expandMap: HTMLButtonElement | null;
  status: HTMLElement | null;
  minerPopup: HTMLElement | null;
  minerPopupTitle: HTMLElement | null;
  popupUpgradeSpeed: HTMLButtonElement | null;
  popupUpgradeRadius: HTMLButtonElement | null;
  popupSpeedCost: HTMLElement | null;
  popupRadiusCost: HTMLElement | null;
  popupSpeedLevel: HTMLElement | null;
  popupRadiusLevel: HTMLElement | null;
  popupReposition: HTMLButtonElement | null;
  coalGenerationCost: HTMLElement | null;
  coalGenerationLevel: HTMLElement | null;
  buyCoalGeneration: HTMLButtonElement | null;
}

// State
const state: GameState = {
  coins: 0,
  idleMinerOwned: 0,
  mapExpansions: 0,
  coalGenerationLevel: 0,
  lastTick: Date.now(),
  lastRenderedMapSize: 0,
  idleMinerCooldowns: [],
  idleMinerPositions: [],
  idleMinerUpgrades: [],
};

const interactionState: InteractionState = {
  activeMinerIndex: null,
  selectedMinerIndex: null,
  repositionMode: false,
  placementMode: false,
};

const idleMiner: UpgradeConfig = {
  baseCost: 10,
  growth: 1.15,
  triggerIntervalSeconds: 5,
};

const fasterMinerUpgrade: UpgradeConfig = {
  baseCost: 50,
  growth: 1.2,
  bonusClicksPerSecond: 0.1,
};

const minerRadiusUpgrade: UpgradeConfig = {
  baseCost: 60,
  growth: 1.35,
  areaMultiplierPerLevel: 1.2,
};

const coalGenerationUpgrade: UpgradeConfig = {
  baseCost: 75,
  growth: 1.25,
  bonusClicksPerSecond: 0.05,
};

// UI Element references
const ui: UIElements = {
  coins: document.getElementById("coins"),
  perSecond: document.getElementById("per-second"),
  idleMinerCost: document.getElementById("idle-miner-cost"),
  idleMinerOwned: document.getElementById("idle-miner-owned"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsModal: document.getElementById("settings-modal"),
  buyIdleMiner: document.getElementById("buy-idle-miner") as HTMLButtonElement,
  save: document.getElementById("save") as HTMLButtonElement,
  reset: document.getElementById("reset") as HTMLButtonElement,
  mapEnvironment: document.getElementById("map-environment"),
  mapSize: document.getElementById("map-size"),
  mapGrid: document.getElementById("map-grid"),
  minerRing: document.getElementById("miner-ring"),
  mapExpandCost: document.getElementById("map-expand-cost"),
  mapExpansions: document.getElementById("map-expansions"),
  expandMap: document.getElementById("expand-map") as HTMLButtonElement,
  status: document.getElementById("status"),
  minerPopup: document.getElementById("miner-popup"),
  minerPopupTitle: document.getElementById("miner-popup-title"),
  popupUpgradeSpeed: document.getElementById("popup-upgrade-speed") as HTMLButtonElement,
  popupUpgradeRadius: document.getElementById("popup-upgrade-radius") as HTMLButtonElement,
  popupSpeedCost: document.getElementById("popup-speed-cost"),
  popupRadiusCost: document.getElementById("popup-radius-cost"),
  popupSpeedLevel: document.getElementById("popup-speed-level"),
  popupRadiusLevel: document.getElementById("popup-radius-level"),
  popupReposition: document.getElementById("popup-reposition") as HTMLButtonElement,
  coalGenerationCost: document.getElementById("coal-generation-cost"),
  coalGenerationLevel: document.getElementById("coal-generation-level"),
  buyCoalGeneration: document.getElementById("buy-coal-generation") as HTMLButtonElement,
};

// Utility functions
function round(value: number, digits: number = 1): number {
  return Number(value.toFixed(digits));
}

function getUpgradeCost(config: UpgradeConfig, owned: number): number {
  return Math.floor(config.baseCost * config.growth ** owned);
}

function getMapSize(): number {
  return 1 + state.mapExpansions;
}

function getMapPixelSize(mapSize: number): number {
  return mapSize * TILE_SIZE_PX + (mapSize - 1) * TILE_GAP_PX;
}

function getMapExpansionCost(): number {
  const nextUpgradeCount = state.mapExpansions + 1;
  return 10 * nextUpgradeCount ** 3;
}

function getIdleMinerCost(): number {
  const nextCount = state.idleMinerOwned + 1;
  return idleMiner.baseCost * nextCount ** 2;
}

function getMinerUpgrade(minerIndex: number): MinerUpgrade {
  const upgrade = state.idleMinerUpgrades[minerIndex];
  if (!upgrade) {
    return { speedLevel: 0, radiusLevel: 0 };
  }
  return {
    speedLevel: Number(upgrade.speedLevel) || 0,
    radiusLevel: Number(upgrade.radiusLevel) || 0,
  };
}

function getMinerClicksPerSecond(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  const triggerInterval = idleMiner.triggerIntervalSeconds || 5;
  const bonus = fasterMinerUpgrade.bonusClicksPerSecond || 0.1;
  return 1 / triggerInterval + upgrade.speedLevel * bonus;
}

function getMinerCooldownSeconds(minerIndex: number): number {
  const clicksPerSecond = getMinerClicksPerSecond(minerIndex);
  if (clicksPerSecond <= 0) {
    return Infinity;
  }
  return 1 / clicksPerSecond;
}

function getMinerSpeedUpgradeCost(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  return getUpgradeCost(fasterMinerUpgrade, upgrade.speedLevel);
}

function getMinerRadiusUpgradeCost(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  return getUpgradeCost(minerRadiusUpgrade, upgrade.radiusLevel);
}

function getMinerEffectRadiusPx(minerIndex: number): number {
  const upgrade = getMinerUpgrade(minerIndex);
  const multiplier = minerRadiusUpgrade.areaMultiplierPerLevel || 1.2;
  const areaMultiplier = multiplier ** upgrade.radiusLevel;
  return BASE_MINER_EFFECT_RADIUS_PX * Math.sqrt(areaMultiplier);
}

function getCoalGenerationCost(): number {
  return getUpgradeCost(coalGenerationUpgrade, state.coalGenerationLevel);
}

function getCoalSpawnChance(): number {
  return 0.05 * (1 + state.coalGenerationLevel * 0.5);
}

function getCoinsPerSecond(): number {
  let total = 0;
  for (let minerIndex = 0; minerIndex < state.idleMinerOwned; minerIndex += 1) {
    total += getMinerClicksPerSecond(minerIndex);
  }
  return total;
}

function format(value: number): string {
  return round(value, 1).toLocaleString();
}

function setStatus(message: string): void {
  if (!ui.status) return;
  ui.status.textContent = message;
  if (!message) {
    return;
  }
  setTimeout(() => {
    if (ui.status && ui.status.textContent === message) {
      ui.status.textContent = "";
    }
  }, 1600);
}

function canAfford(cost: number): boolean {
  return state.coins >= cost;
}

function saveGame(showStatus: boolean = true): void {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      coins: state.coins,
      idleMinerOwned: state.idleMinerOwned,
      idleMinerCooldowns: state.idleMinerCooldowns,
      idleMinerPositions: state.idleMinerPositions,
      idleMinerUpgrades: state.idleMinerUpgrades,
      mapExpansions: state.mapExpansions,
      coalGenerationLevel: state.coalGenerationLevel,
      savedAt: Date.now(),
    })
  );

  if (showStatus) {
    setStatus("Saved.");
  }
}

function syncIdleMinerState(): void {
  while (state.idleMinerCooldowns.length < state.idleMinerOwned) {
    const minerIndex = state.idleMinerCooldowns.length;
    state.idleMinerCooldowns.push(getMinerCooldownSeconds(minerIndex));
  }
  if (state.idleMinerCooldowns.length > state.idleMinerOwned) {
    state.idleMinerCooldowns.length = state.idleMinerOwned;
  }

  while (state.idleMinerPositions.length < state.idleMinerOwned) {
    state.idleMinerPositions.push(null);
  }
  if (state.idleMinerPositions.length > state.idleMinerOwned) {
    state.idleMinerPositions.length = state.idleMinerOwned;
  }

  while (state.idleMinerUpgrades.length < state.idleMinerOwned) {
    state.idleMinerUpgrades.push({ speedLevel: 0, radiusLevel: 0 });
  }
  if (state.idleMinerUpgrades.length > state.idleMinerOwned) {
    state.idleMinerUpgrades.length = state.idleMinerOwned;
  }

  if (interactionState.selectedMinerIndex !== null && interactionState.selectedMinerIndex >= state.idleMinerOwned) {
    closeMinerPopup();
  }
}

function loadGame(): void {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    state.coins = Number(parsed.coins) || 0;
    state.idleMinerOwned = Number(parsed.idleMinerOwned ?? (parsed as Record<string, unknown>).cursorOwned) || 0;

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

    const legacySpeedLevel = Number((parsed as Record<string, unknown>).fasterMinerOwned ?? (parsed as Record<string, unknown>).minerOwned) || 0;
    const legacyRadiusLevel = Number((parsed as Record<string, unknown>).minerRadiusOwned) || 0;

    state.idleMinerUpgrades = Array.isArray(parsed.idleMinerUpgrades)
      ? parsed.idleMinerUpgrades
          .map((upgrade: unknown) => {
            const u = upgrade as Record<string, unknown>;
            return {
              speedLevel: Number(u?.speedLevel) || 0,
              radiusLevel: Number(u?.radiusLevel) || 0,
            };
          })
          .filter((upgrade) => upgrade.speedLevel >= 0 && upgrade.radiusLevel >= 0)
      : [];

    if (state.idleMinerUpgrades.length === 0 && state.idleMinerOwned > 0) {
      for (let index = 0; index < state.idleMinerOwned; index += 1) {
        state.idleMinerUpgrades.push({ speedLevel: legacySpeedLevel, radiusLevel: legacyRadiusLevel });
      }
    }

    state.mapExpansions = Number(parsed.mapExpansions) || 0;
    state.coalGenerationLevel = Number(parsed.coalGenerationLevel) || 0;
    syncIdleMinerState();

    const now = Date.now();
    const savedAt = Number(parsed.savedAt) || now;
    const secondsAway = Math.min((now - savedAt) / 1000, 8 * 60 * 60);
    state.coins += getCoinsPerSecond() * secondsAway;

    setStatus(`Welcome back! Earned ${round(getCoinsPerSecond() * secondsAway, 0).toLocaleString()} while away.`);
  } catch {
    setStatus("Save data was invalid and has been ignored.");
  }
}

function getDefaultMinerPosition(index: number, count: number): Position {
  const mapSize = getMapSize();
  const mapPixelSize = getMapPixelSize(mapSize);
  const ringRadius = Math.max(26, mapPixelSize * 0.28);
  const angle = (index / Math.max(1, count)) * (Math.PI * 2) - Math.PI / 2;
  return {
    x: Math.cos(angle) * ringRadius,
    y: Math.sin(angle) * ringRadius,
  };
}

function getMinerPosition(minerIndex: number): Position {
  const position = state.idleMinerPositions[minerIndex];
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    return position;
  }
  return getDefaultMinerPosition(minerIndex, state.idleMinerOwned);
}

function getTileBoundsByIndex(tileIndex: number, mapSize: number): Bounds {
  const column = tileIndex % mapSize;
  const row = Math.floor(tileIndex / mapSize);
  const mapPixelSize = getMapPixelSize(mapSize);
  const left = -mapPixelSize / 2 + column * (TILE_SIZE_PX + TILE_GAP_PX);
  const top = -mapPixelSize / 2 + row * (TILE_SIZE_PX + TILE_GAP_PX);
  return {
    left,
    top,
    right: left + TILE_SIZE_PX,
    bottom: top + TILE_SIZE_PX,
  };
}

function getTileCoverageInMinerRadius(minerPosition: Position, tileBounds: Bounds, radiusPx: number): number {
  const sampleCountPerAxis = 5;
  const totalSamples = sampleCountPerAxis * sampleCountPerAxis;
  const step = TILE_SIZE_PX / sampleCountPerAxis;
  const radiusSquared = radiusPx * radiusPx;
  let insideSamples = 0;

  for (let row = 0; row < sampleCountPerAxis; row += 1) {
    for (let column = 0; column < sampleCountPerAxis; column += 1) {
      const sampleX = tileBounds.left + (column + 0.5) * step;
      const sampleY = tileBounds.top + (row + 0.5) * step;
      const dx = sampleX - minerPosition.x;
      const dy = sampleY - minerPosition.y;
      if (dx * dx + dy * dy <= radiusSquared) {
        insideSamples += 1;
      }
    }
  }

  return insideSamples / totalSamples;
}

function getEligibleTilesForMiner(minerIndex: number, availableTiles: HTMLElement[], mapSize: number): HTMLElement[] {
  const minerPosition = getMinerPosition(minerIndex);
  const minerRadius = getMinerEffectRadiusPx(minerIndex);

  return availableTiles.filter((tile) => {
    const tileIndex = Number(tile.dataset.tileIndex);
    if (!Number.isInteger(tileIndex) || tileIndex < 0) {
      return false;
    }

    const bounds = getTileBoundsByIndex(tileIndex, mapSize);
    const coverage = getTileCoverageInMinerRadius(minerPosition, bounds, minerRadius);
    return coverage >= MIN_TILE_COVERAGE_IN_RADIUS;
  });
}

function setSettingsModalOpen(isOpen: boolean): void {
  if (!ui.settingsModal || !ui.settingsToggle) return;
  ui.settingsModal.classList.toggle("hidden", !isOpen);
  ui.settingsModal.setAttribute("aria-hidden", String(!isOpen));
  ui.settingsToggle.setAttribute("aria-expanded", String(isOpen));
}

function openMinerPopup(minerIndex: number): void {
  interactionState.selectedMinerIndex = minerIndex;
  interactionState.repositionMode = false;
  renderMinerPopup();
}

function closeMinerPopup(): void {
  interactionState.selectedMinerIndex = null;
  interactionState.repositionMode = false;
  interactionState.placementMode = false;
  interactionState.activeMinerIndex = null;
  if (ui.minerPopup) {
    ui.minerPopup.classList.add("hidden");
  }
}

function activateTile(tile: HTMLElement, shouldRender: boolean = true): boolean {
  if (!(tile instanceof HTMLElement) || tile.classList.contains("map-tile--cooldown")) {
    return false;
  }

  const isCoal = tile.dataset.tileType === "coal";
  state.coins += isCoal ? 3 : 1;
  
  tile.classList.add("map-tile--cooldown");
  tile.dataset.tileType = "";
  tile.classList.remove("map-tile--coal");
  
  setTimeout(() => {
    tile.classList.remove("map-tile--cooldown");
    // Regenerate tile type when cooldown ends
    if (Math.random() < getCoalSpawnChance()) {
      tile.dataset.tileType = "coal";
      tile.classList.add("map-tile--coal");
    } else {
      tile.dataset.tileType = "sand";
      tile.classList.remove("map-tile--coal");
    }
  }, 1000);

  if (shouldRender) {
    render();
  }
  return true;
}

function buyIdleMiner(): void {
  const cost = getIdleMinerCost();
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.idleMinerOwned += 1;
  syncIdleMinerState();
  render();
}

function buyMinerSpeedUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }

  const cost = getMinerSpeedUpgradeCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }

  const previousCooldown = getMinerCooldownSeconds(minerIndex);
  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].speedLevel += 1;
  const updatedCooldown = getMinerCooldownSeconds(minerIndex);

  if (Number.isFinite(previousCooldown) && previousCooldown > 0) {
    const scale = updatedCooldown / previousCooldown;
    state.idleMinerCooldowns[minerIndex] = Math.max(0, state.idleMinerCooldowns[minerIndex] * scale);
  }

  render();
}

function buyMinerRadiusUpgrade(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }

  const cost = getMinerRadiusUpgradeCost(minerIndex);
  if (!canAfford(cost)) {
    return;
  }

  state.coins -= cost;
  state.idleMinerUpgrades[minerIndex].radiusLevel += 1;
  render();
}

function toggleMinerRepositionMode(): void {
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null) {
    return;
  }

  interactionState.placementMode = !interactionState.placementMode;
  renderMinerPopup();
  renderMinerRing();
}

function resetGame(): void {
  localStorage.removeItem(SAVE_KEY);
  state.coins = 0;
  state.idleMinerOwned = 0;
  state.mapExpansions = 0;
  state.coalGenerationLevel = 0;
  state.lastTick = Date.now();
  state.lastRenderedMapSize = 0;
  state.idleMinerCooldowns = [];
  state.idleMinerPositions = [];
  state.idleMinerUpgrades = [];
  closeMinerPopup();
  render();
  setSettingsModalOpen(false);
  setStatus("Progress reset.");
}

function buyMapExpansion(): void {
  const cost = getMapExpansionCost();
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.mapExpansions += 1;
  render();
}

function buyCoalGeneration(): void {
  const cost = getCoalGenerationCost();
  if (!canAfford(cost)) {
    return;
  }
  state.coins -= cost;
  state.coalGenerationLevel += 1;
  render();
}

function renderMap(): void {
  if (!ui.mapGrid) return;
  const mapSize = getMapSize();
  if (state.lastRenderedMapSize === mapSize) {
    return;
  }

  const tileCount = mapSize * mapSize;
  ui.mapGrid.style.gridTemplateColumns = `repeat(${mapSize}, 38px)`;
  ui.mapGrid.innerHTML = "";

  for (let index = 0; index < tileCount; index += 1) {
    const tile = document.createElement("div");
    tile.className = "map-tile";
    tile.dataset.tileIndex = index.toString();
    
    // Randomly assign coal or sand type
    const isCoal = Math.random() < getCoalSpawnChance();
    tile.dataset.tileType = isCoal ? "coal" : "sand";
    if (isCoal) {
      tile.classList.add("map-tile--coal");
    }
    
    tile.setAttribute("aria-label", isCoal ? "Coal tile" : "Sandy tile");
    ui.mapGrid.appendChild(tile);
  }

  state.lastRenderedMapSize = mapSize;
}

function renderMinerRing(): void {
  if (!ui.minerRing) return;
  ui.minerRing.innerHTML = "";
  if (state.idleMinerOwned <= 0) {
    return;
  }

  for (let index = 0; index < state.idleMinerOwned; index += 1) {
    const cooldownLeft = Math.max(0, state.idleMinerCooldowns[index] ?? 0);
    const { x, y } = getMinerPosition(index);

    const minerNode = document.createElement("div");
    minerNode.className = "miner-node";
    if (interactionState.activeMinerIndex === index) {
      minerNode.classList.add("dragging");
    }
    minerNode.dataset.minerIndex = index.toString();
    minerNode.style.setProperty("--miner-radius", `${getMinerEffectRadiusPx(index)}px`);
    minerNode.style.left = `calc(50% + ${x}px)`;
    minerNode.style.top = `calc(50% + ${y}px)`;
    minerNode.innerHTML = `<strong>M${index + 1}</strong>${cooldownLeft.toFixed(1)}s`;
    ui.minerRing.appendChild(minerNode);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function moveMinerToPointer(clientX: number, clientY: number): void {
  const minerIndex = interactionState.activeMinerIndex;
  if (minerIndex === null || !ui.mapEnvironment) {
    return;
  }

  const bounds = ui.mapEnvironment.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const maxX = Math.max(20, bounds.width / 2 - 20);
  const maxY = Math.max(20, bounds.height / 2 - 20);

  const x = clamp(clientX - centerX, -maxX, maxX);
  const y = clamp(clientY - centerY, -maxY, maxY);

  state.idleMinerPositions[minerIndex] = { x, y };
  renderMinerRing();
}

function renderMinerPopup(): void {
  if (!ui.minerPopup) return;
  const minerIndex = interactionState.selectedMinerIndex;
  if (minerIndex === null || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
    ui.minerPopup.classList.add("hidden");
    return;
  }

  const upgrade = getMinerUpgrade(minerIndex);
  const speedCost = getMinerSpeedUpgradeCost(minerIndex);
  const radiusCost = getMinerRadiusUpgradeCost(minerIndex);

  ui.minerPopup.classList.remove("hidden");
  if (ui.minerPopupTitle) ui.minerPopupTitle.textContent = `Miner ${minerIndex + 1}`;
  if (ui.popupSpeedLevel) ui.popupSpeedLevel.textContent = upgrade.speedLevel.toString();
  if (ui.popupRadiusLevel) ui.popupRadiusLevel.textContent = upgrade.radiusLevel.toString();
  if (ui.popupSpeedCost) ui.popupSpeedCost.textContent = speedCost.toLocaleString();
  if (ui.popupRadiusCost) ui.popupRadiusCost.textContent = radiusCost.toLocaleString();
  if (ui.popupUpgradeSpeed) ui.popupUpgradeSpeed.disabled = !canAfford(speedCost);
  if (ui.popupUpgradeRadius) ui.popupUpgradeRadius.disabled = !canAfford(radiusCost);
  if (ui.popupReposition) ui.popupReposition.textContent = interactionState.placementMode ? "Click map to place…" : "Reposition";
}

function runIdleMiners(deltaSeconds: number): void {
  if (state.idleMinerOwned <= 0) {
    state.idleMinerCooldowns = [];
    return;
  }

  syncIdleMinerState();
  let activations = 0;
  const maxTriggersPerMinerPerTick = 25;
  const mapSize = getMapSize();

  for (let minerIndex = 0; minerIndex < state.idleMinerCooldowns.length; minerIndex += 1) {
    const cooldown = getMinerCooldownSeconds(minerIndex);
    if (!Number.isFinite(cooldown) || cooldown <= 0) {
      continue;
    }

    state.idleMinerCooldowns[minerIndex] -= deltaSeconds;
    let triggerCount = 0;

    while (state.idleMinerCooldowns[minerIndex] <= 0 && triggerCount < maxTriggersPerMinerPerTick) {
      state.idleMinerCooldowns[minerIndex] += cooldown;
      triggerCount += 1;

      if (!ui.mapGrid) continue;
      const availableTiles = Array.from(ui.mapGrid.querySelectorAll(".map-tile:not(.map-tile--cooldown)")) as HTMLElement[];
      if (availableTiles.length === 0) {
        continue;
      }

      const eligibleTiles = getEligibleTilesForMiner(minerIndex, availableTiles, mapSize);
      if (eligibleTiles.length === 0) {
        continue;
      }

      const randomIndex = Math.floor(Math.random() * eligibleTiles.length);
      const tile = eligibleTiles[randomIndex];
      if (activateTile(tile, false)) {
        activations += 1;
      }
    }
  }

  if (activations > 0) {
    render();
  }
}

function render(): void {
  syncIdleMinerState();

  const cps = getCoinsPerSecond();
  const idleMinerCost = getIdleMinerCost();
  const mapCost = getMapExpansionCost();
  const coalCost = getCoalGenerationCost();
  const mapSize = getMapSize();

  if (ui.coins) ui.coins.textContent = format(state.coins);
  if (ui.perSecond) ui.perSecond.textContent = format(cps);
  if (ui.idleMinerCost) ui.idleMinerCost.textContent = idleMinerCost.toLocaleString();
  if (ui.idleMinerOwned) ui.idleMinerOwned.textContent = state.idleMinerOwned.toString();
  if (ui.buyIdleMiner) ui.buyIdleMiner.disabled = !canAfford(idleMinerCost);
  if (ui.mapExpandCost) ui.mapExpandCost.textContent = mapCost.toLocaleString();
  if (ui.mapExpansions) ui.mapExpansions.textContent = state.mapExpansions.toString();
  if (ui.mapSize) ui.mapSize.textContent = `${mapSize}x${mapSize}`;
  if (ui.expandMap) ui.expandMap.disabled = !canAfford(mapCost);
  if (ui.coalGenerationCost) ui.coalGenerationCost.textContent = coalCost.toLocaleString();
  if (ui.coalGenerationLevel) ui.coalGenerationLevel.textContent = state.coalGenerationLevel.toString();
  if (ui.buyCoalGeneration) ui.buyCoalGeneration.disabled = !canAfford(coalCost);

  renderMap();
  renderMinerRing();
  renderMinerPopup();
}

function gameLoop(): void {
  const now = Date.now();
  const deltaSeconds = (now - state.lastTick) / 1000;
  state.lastTick = now;
  runIdleMiners(deltaSeconds);
  render();
}

// Event listeners
if (ui.settingsToggle) {
  ui.settingsToggle.addEventListener("click", () => {
    if (!ui.settingsModal) return;
    const isHidden = ui.settingsModal.classList.contains("hidden");
    setSettingsModalOpen(isHidden);
  });
}

if (ui.settingsModal) {
  ui.settingsModal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest(".modal-card")) {
      return;
    }
    setSettingsModalOpen(false);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSettingsModalOpen(false);
    closeMinerPopup();
  }
});

const handleMapInteract = (event: PointerEvent): void => {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  event.preventDefault();

  // During placement mode, clicking finalizes the placement
  if (interactionState.placementMode && interactionState.selectedMinerIndex !== null) {
    // Position was already updated by pointermove, just finalize
    return;
  }

  // Normal tile activation
  if (!target.classList.contains("map-tile")) {
    return;
  }
  activateTile(target);
};

if (ui.mapGrid) {
  ui.mapGrid.addEventListener("pointerdown", handleMapInteract);
}

if (ui.minerRing) {
  ui.minerRing.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const node = target.closest(".miner-node") as HTMLElement | null;
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const minerIndex = Number(node.dataset.minerIndex);
    if (!Number.isInteger(minerIndex) || minerIndex < 0 || minerIndex >= state.idleMinerOwned) {
      return;
    }

    event.preventDefault();

    openMinerPopup(minerIndex);
  });
}

window.addEventListener("pointermove", (event) => {
  if (!interactionState.placementMode || interactionState.selectedMinerIndex === null || !ui.mapEnvironment) {
    return;
  }

  const envBounds = ui.mapEnvironment.getBoundingClientRect();
  const cursorX = event.clientX - envBounds.left - envBounds.width / 2;
  const cursorY = event.clientY - envBounds.top - envBounds.height / 2;
  const minerIndex = interactionState.selectedMinerIndex;

  state.idleMinerPositions[minerIndex] = { x: cursorX, y: cursorY };
  renderMinerRing();
});

window.addEventListener("pointerup", () => {
  if (interactionState.placementMode && interactionState.selectedMinerIndex !== null) {
    interactionState.placementMode = false;
    render();
  }
});

if (ui.mapEnvironment) {
  ui.mapEnvironment.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest(".miner-popup") || target.closest(".miner-node")) {
      return;
    }
    closeMinerPopup();
  });
}

if (ui.popupUpgradeSpeed) {
  ui.popupUpgradeSpeed.addEventListener("click", buyMinerSpeedUpgrade);
}
if (ui.popupUpgradeRadius) {
  ui.popupUpgradeRadius.addEventListener("click", buyMinerRadiusUpgrade);
}
if (ui.popupReposition) {
  ui.popupReposition.addEventListener("click", toggleMinerRepositionMode);
}
if (ui.buyIdleMiner) {
  ui.buyIdleMiner.addEventListener("click", buyIdleMiner);
}
if (ui.expandMap) {
  ui.expandMap.addEventListener("click", buyMapExpansion);
}
if (ui.buyCoalGeneration) {
  ui.buyCoalGeneration.addEventListener("click", buyCoalGeneration);
}
if (ui.save) {
  ui.save.addEventListener("click", () => saveGame(true));
}
if (ui.reset) {
  ui.reset.addEventListener("click", resetGame);
}

loadGame();
state.lastTick = Date.now();
render();

setInterval(gameLoop, 100);
setInterval(() => saveGame(false), 10000);

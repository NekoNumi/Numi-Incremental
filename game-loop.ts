interface IdleLoopState {
  idleMinerOwned: number;
  idleMinerCooldowns: number[];
}

interface RunIdleMinerLoopDeps {
  state: IdleLoopState;
  mapGrid: HTMLElement | null;
  syncIdleMinerState: () => void;
  getMapSize: () => number;
  getMinerCooldownSeconds: (minerIndex: number) => number;
  getEligibleTilesForMiner: (minerIndex: number, availableTiles: HTMLElement[], mapSize: number) => HTMLElement[];
  chooseTargetTile: (minerIndex: number, eligibleTiles: HTMLElement[]) => HTMLElement;
  activateTile: (tile: HTMLElement, shouldRender: boolean, minerIndex: number | null) => boolean;
  triggerChainReaction: (minerIndex: number, sourceTile: HTMLElement, mapSize: number) => number;
  rollDoubleActivation: (minerIndex: number) => number;
  getActivationCountFromRoll: (roll: number) => number;
  render: () => void;
}

export function runIdleMinersLoop(deltaSeconds: number, deps: RunIdleMinerLoopDeps): void {
  const { state } = deps;

  if (state.idleMinerOwned <= 0) {
    state.idleMinerCooldowns = [];
    return;
  }

  deps.syncIdleMinerState();
  let activations = 0;
  const maxTriggersPerMinerPerTick = 25;
  const mapSize = deps.getMapSize();

  for (let minerIndex = 0; minerIndex < state.idleMinerCooldowns.length; minerIndex += 1) {
    const cooldown = deps.getMinerCooldownSeconds(minerIndex);
    if (!Number.isFinite(cooldown) || cooldown <= 0) {
      continue;
    }

    state.idleMinerCooldowns[minerIndex] -= deltaSeconds;
    let triggerCount = 0;

    while (state.idleMinerCooldowns[minerIndex] <= 0 && triggerCount < maxTriggersPerMinerPerTick) {
      state.idleMinerCooldowns[minerIndex] += cooldown;
      triggerCount += 1;

      if (!deps.mapGrid) {
        continue;
      }

      const availableTiles = Array.from(deps.mapGrid.querySelectorAll(".map-tile:not(.map-tile--cooldown)")) as HTMLElement[];
      if (availableTiles.length === 0) {
        continue;
      }

      const eligibleTiles = deps.getEligibleTilesForMiner(minerIndex, availableTiles, mapSize);
      if (eligibleTiles.length === 0) {
        continue;
      }

      const tile = deps.chooseTargetTile(minerIndex, eligibleTiles);
      if (deps.activateTile(tile, false, minerIndex)) {
        activations += 1;
        activations += deps.triggerChainReaction(minerIndex, tile, mapSize);

        const roll = deps.rollDoubleActivation(minerIndex);
        const bonusActivations = deps.getActivationCountFromRoll(roll);

        for (let i = 0; i < bonusActivations; i += 1) {
          const bonusTiles = deps.getEligibleTilesForMiner(minerIndex, availableTiles, mapSize);
          if (bonusTiles.length > 0) {
            const randomBonusIndex = Math.floor(Math.random() * bonusTiles.length);
            if (deps.activateTile(bonusTiles[randomBonusIndex], false, minerIndex)) {
              activations += 1;
              activations += deps.triggerChainReaction(minerIndex, bonusTiles[randomBonusIndex], mapSize);
            }
          }
        }
      }
    }
  }

  if (activations > 0) {
    deps.render();
  }
}

const TILE_SIZE = 64;
const ENEMY_SPEEDS = {
  steady: 1.2,
  brisk: 1.6,
  swift: 2,
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const lineSelect = document.getElementById('lineSelect');
const selectionInfo = document.getElementById('selectionInfo');
const upgradeBtn = document.getElementById('upgradeBtn');
const heartsLabel = document.getElementById('hearts');
const waveLabel = document.getElementById('wave');
const coinsLabel = document.getElementById('coins');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');

let tierData;
let battlefield;
let enemyPath = [];
let buildableTiles = [];
let towers = [];
let enemies = [];
let lastFrame = 0;
let running = false;
let hearts = 5;
let spawnTimer = 0;
let wave = 1;
let selectedTower = null;
let coins = 0;

const BASE_PLACEMENT_COST = 10;
const UPGRADE_BASE_COST = 12;
const UPGRADE_SCALE = 6;
const MIN_BOUNTY = 2;

const COLORS = {
  grid: '#1a2033',
  path: '#f7b94d',
  attackWindow: '#8ce0ff',
  escape: '#f97316',
  buildableFill: 'rgba(122,223,138,0.22)',
  buildableStroke: '#7adf8a',
  enemy: '#ff6b6b',
  enemyStroke: '#1f0f20',
  towerBody: '#a78bfa',
  towerCore: '#0b0f1a',
  selection: '#fbbf24',
  hearts: '#f472b6',
  wave: '#facc15',
};

const stateDefaults = () => ({
  towers: [],
  enemies: [],
  spawnTimer: 0,
  wave: 1,
  hearts: 5,
  selectedTower: null,
  coins: 20,
});

async function init() {
  tierData = await fetch('/api/tier-data').then((res) => res.json());
  battlefield = tierData.battlefield;
  enemyPath = battlefield.enemyPath;
  buildableTiles = battlefield.buildableTiles;

  canvas.width = battlefield.gridWidth * TILE_SIZE;
  canvas.height = battlefield.gridHeight * TILE_SIZE;

  populateLineSelect();
  attachUIHandlers();
  resetState();
  requestAnimationFrame(loop);
}

function resetState() {
  const defaults = stateDefaults();
  towers = defaults.towers;
  enemies = defaults.enemies;
  spawnTimer = defaults.spawnTimer;
  wave = defaults.wave;
  hearts = defaults.hearts;
  selectedTower = defaults.selectedTower;
  coins = defaults.coins;
  running = false;
  setStatus('');
  updateLabels();
  render();
}

function attachUIHandlers() {
  startBtn.addEventListener('click', () => { running = true; });
  pauseBtn.addEventListener('click', () => { running = false; });
  resetBtn.addEventListener('click', resetState);
  upgradeBtn.addEventListener('click', () => {
    if (selectedTower) {
      const cost = getUpgradeCost(selectedTower);
      if (!selectedTower.canUpgrade()) return;
      if (coins < cost) {
        setStatus(`Need ${cost} coins to upgrade (have ${coins}).`, 'warn');
        return;
      }
      coins -= cost;
      selectedTower.upgrade();
      setStatus(`Upgraded to Tier ${selectedTower.currentEntity().tier}.`, 'success');
      updateSelectionInfo(selectedTower);
      updateLabels();
    }
  });

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * battlefield.gridWidth);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * battlefield.gridHeight);
    const clickedTower = towers.find((t) => t.tile.x === x && t.tile.y === y);
    if (clickedTower) {
      if (selectedTower && selectedTower !== clickedTower && selectedTower.canMergeWith(clickedTower)) {
        mergeTowers(selectedTower, clickedTower);
        return;
      }
      selectedTower = clickedTower;
      updateSelectionInfo(clickedTower);
      upgradeBtn.disabled = !clickedTower.canUpgrade() || coins < getUpgradeCost(clickedTower);
      setStatus('');
      return;
    }
    const tile = buildableTiles.find((t) => t.x === x && t.y === y);
    if (tile) {
      placeTower(tile);
    }
  });
}

function populateLineSelect() {
  tierData.lines.forEach((line) => {
    const option = document.createElement('option');
    option.value = line.id;
    option.textContent = `${line.name} (Tier 1: ${line.tiers.find((t) => t.tier === 1).name})`;
    lineSelect.appendChild(option);
  });
  lineSelect.addEventListener('change', () => updateSelectionInfo());
  updateSelectionInfo();
}

function updateSelectionInfo(tower) {
  if (tower) {
    const current = tower.currentEntity();
    const next = tower.nextEntity();
    const upgradeCost = tower.canUpgrade() ? getUpgradeCost(tower) : null;
    selectionInfo.innerHTML = `
      <div><strong>${current.name}</strong> (Tier ${current.tier})</div>
      <div>Range ${current.stats.range.toFixed(1)}, Power ${current.stats.attackPower}, Speed ${current.stats.attackSpeed}</div>
      ${next ? `<div>Next: ${next.name} (Tier ${next.tier})</div>` : '<div>Max tier reached</div>'}
      ${upgradeCost ? `<div>Upgrade Cost: ${upgradeCost} coins</div>` : ''}
    `;
    upgradeBtn.disabled = !tower.canUpgrade() || coins < getUpgradeCost(tower);
  } else {
    const line = getSelectedLine();
    const base = getLineSequence(line)[0];
    const placementCost = getPlacementCost(line);
    selectionInfo.innerHTML = `
      <div><strong>${base.name}</strong> (Tier ${base.tier})</div>
      <div>Range ${base.stats.range.toFixed(1)}, Power ${base.stats.attackPower}, Speed ${base.stats.attackSpeed}</div>
      <div>Cost to deploy: ${placementCost} coins.</div>
      <div>Click a build tile to place this unit.</div>
    `;
    upgradeBtn.disabled = true;
  }
}

function getSelectedLine() {
  const lineId = lineSelect.value || tierData.lines[0].id;
  return tierData.lines.find((l) => l.id === lineId);
}

function placeTower(tile) {
  if (towers.some((t) => t.tile.x === tile.x && t.tile.y === tile.y)) return;
  const line = getSelectedLine();
  const cost = getPlacementCost(line);
  if (coins < cost) {
    setStatus(`Need ${cost} coins to deploy (have ${coins}).`, 'warn');
    return;
  }
  const tower = new Tower(line, tile);
  towers.push(tower);
  coins -= cost;
  selectedTower = tower;
  setStatus(`Deployed ${tower.currentEntity().name} for ${cost} coins.`, 'success');
  updateSelectionInfo(tower);
  upgradeBtn.disabled = !tower.canUpgrade() || coins < getUpgradeCost(tower);
  updateLabels();
}

class Tower {
  constructor(line, tile) {
    this.lineId = line.id;
    this.tile = tile;
    this.sequence = getLineSequence(line);
    this.stage = 0;
    this.cooldown = 0;
  }

  currentEntity() {
    return this.sequence[this.stage];
  }

  nextEntity() {
    return this.sequence[this.stage + 1];
  }

  canUpgrade() {
    return this.stage < this.sequence.length - 1;
  }

  canMergeWith(other) {
    if (!other) return false;
    return this.canUpgrade() && other.canUpgrade() && this.lineId === other.lineId && this.stage === other.stage;
  }

  upgrade() {
    if (this.canUpgrade()) {
      this.stage += 1;
    }
  }

  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
    const target = findTarget(this);
    if (target && this.cooldown <= 0) {
      fireAt(this, target);
    }
  }
}

class Enemy {
  constructor(template) {
    this.template = template;
    this.health = template.health;
    this.pathIndex = 0;
    this.progress = 0;
    this.speed = ENEMY_SPEEDS[template.speed] || 1.2;
    this.bounty = calculateBounty(template);
  }

  get currentTile() {
    return enemyPath[this.pathIndex];
  }

  update(dt) {
    const nextTile = enemyPath[this.pathIndex + 1];
    if (!nextTile) return;
    this.progress += this.speed * dt;
    if (this.progress >= 1) {
      this.pathIndex += 1;
      this.progress = 0;
    }
  }

  isAtEscape() {
    return !!enemyPath[this.pathIndex]?.isEscape;
  }
}

function getLineSequence(line) {
  const tiers = [...line.tiers].sort((a, b) => a.tier - b.tier);
  const finalGod = line.finalGods[0];
  return [...tiers, finalGod].map((entry, idx) => ({ ...entry, stage: idx }));
}

function getPlacementCost() {
  return BASE_PLACEMENT_COST + Math.floor(towers.length * 0.75);
}

function getUpgradeCost(tower) {
  return UPGRADE_BASE_COST + tower.stage * UPGRADE_SCALE;
}

function calculateBounty(template) {
  return Math.max(MIN_BOUNTY, template.bounty || Math.round(template.health / 50));
}

function findTarget(tower) {
  const stats = tower.currentEntity().stats;
  let closest = null;
  let closestDist = Number.MAX_VALUE;
  enemies.forEach((enemy) => {
    const tile = enemy.currentTile;
    if (!tile || !tile.isAttackWindow) return;
    const dx = tile.x - tower.tile.x;
    const dy = tile.y - tower.tile.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= stats.range && dist < closestDist) {
      closest = enemy;
      closestDist = dist;
    }
  });
  return closest;
}

function fireAt(tower, enemy) {
  const stats = tower.currentEntity().stats;
  const damage = Math.max(1, stats.attackPower - enemy.template.defense);
  enemy.health -= damage;
  tower.cooldown = 1 / stats.attackSpeed;
  if (enemy.health <= 0) {
    enemies = enemies.filter((e) => e !== enemy);
    coins += enemy.bounty;
    updateLabels();
    if (selectedTower) {
      upgradeBtn.disabled = !selectedTower.canUpgrade() || coins < getUpgradeCost(selectedTower);
    }
  }
}

function mergeTowers(primary, secondary) {
  primary.upgrade();
  towers = towers.filter((t) => t !== secondary);
  selectedTower = primary;
  setStatus(`Merged into Tier ${primary.currentEntity().tier}.`, 'success');
  updateSelectionInfo(primary);
  upgradeBtn.disabled = !primary.canUpgrade() || coins < getUpgradeCost(primary);
}

function spawnEnemy() {
  const line = tierData.enemyLines[0];
  const template = line.units[(wave - 1) % line.units.length];
  enemies.push(new Enemy(template));
}

function update(dt) {
  if (!running) return;
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnEnemy();
    spawnTimer = Math.max(1.8 - wave * 0.05, 0.6);
    if (wave < 50) wave += 1;
  }

  enemies.forEach((enemy) => enemy.update(dt));
  enemies = enemies.filter((enemy) => {
    if (enemy.isAtEscape()) {
      hearts -= tierData.enemyLines[0].heartDamageOnExit;
      updateLabels();
      return false;
    }
    return true;
  });

  towers.forEach((tower) => tower.update(dt));

  if (hearts <= 0) {
    running = false;
  }
}

function loop(timestamp) {
  const delta = lastFrame ? (timestamp - lastFrame) / 1000 : 0;
  lastFrame = timestamp;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawPath();
  drawBuildable();
  drawEnemies();
  drawTowers();
  drawStatus();
}

function drawGrid() {
  ctx.strokeStyle = COLORS.grid;
  for (let x = 0; x <= battlefield.gridWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= battlefield.gridHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(canvas.width, y * TILE_SIZE);
    ctx.stroke();
  }
}

function drawPath() {
  enemyPath.forEach((tile) => {
    const color = tile.isAttackWindow ? COLORS.attackWindow : COLORS.path;
    drawTile(tile.x, tile.y, color, tile.isEscape ? COLORS.escape : color);
  });
}

function drawBuildable() {
  buildableTiles.forEach((tile) => drawTile(tile.x, tile.y, COLORS.buildableFill, COLORS.buildableStroke));
}

function drawTile(x, y, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.strokeRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    const tile = enemy.currentTile;
    if (!tile) return;
    ctx.fillStyle = COLORS.enemy;
    ctx.strokeStyle = COLORS.enemyStroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tile.x * TILE_SIZE + TILE_SIZE / 2, tile.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawHealthBar(tile.x, tile.y, enemy.health, enemy.template.health);
  });
}

function drawHealthBar(x, y, health, max) {
  const width = TILE_SIZE - 8;
  const height = 6;
  const startX = x * TILE_SIZE + 4;
  const startY = y * TILE_SIZE + TILE_SIZE - 12;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(startX, startY, width, height);
  ctx.fillStyle = '#34d399';
  const pct = Math.max(0, Math.min(1, health / max));
  ctx.fillRect(startX, startY, width * pct, height);
}

function drawTowers() {
  towers.forEach((tower) => {
    const tile = tower.tile;
    const current = tower.currentEntity();
    if (tower === selectedTower) {
      drawRange(tower);
    }
    ctx.fillStyle = COLORS.towerBody;
    ctx.strokeStyle = COLORS.selection;
    ctx.lineWidth = tower === selectedTower ? 3 : 1.2;
    ctx.beginPath();
    ctx.roundRect(tile.x * TILE_SIZE + 10, tile.y * TILE_SIZE + 10, TILE_SIZE - 20, TILE_SIZE - 20, 8);
    ctx.fill();
    if (tower === selectedTower) ctx.stroke();

    ctx.fillStyle = COLORS.towerCore;
    ctx.beginPath();
    ctx.arc(tile.x * TILE_SIZE + TILE_SIZE / 2, tile.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px "Inter", Arial, sans-serif';
    ctx.fillText(`T${current.tier}`, tile.x * TILE_SIZE + 14, tile.y * TILE_SIZE + TILE_SIZE / 2 + 4);
    if (tower === selectedTower) {
      ctx.strokeStyle = COLORS.selection;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(tile.x * TILE_SIZE + 6, tile.y * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12);
    }
  });
}

function drawRange(tower) {
  const stats = tower.currentEntity().stats;
  ctx.save();
  ctx.strokeStyle = 'rgba(99,102,241,0.35)';
  ctx.fillStyle = 'rgba(99,102,241,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(
    tower.tile.x * TILE_SIZE + TILE_SIZE / 2,
    tower.tile.y * TILE_SIZE + TILE_SIZE / 2,
    stats.range * TILE_SIZE,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawStatus() {
  updateLabels();
  if (!running && hearts <= 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f43f5e';
    ctx.font = '28px Arial';
    ctx.fillText('Game Over - reset to try again.', 20, 40);
  }
}

function updateLabels() {
  heartsLabel.innerHTML = `❤️ Hearts: <strong>${Math.max(0, hearts)}</strong>`;
  waveLabel.innerHTML = `🌊 Wave: <strong>${wave}</strong>`;
  coinsLabel.innerHTML = `🪙 Coins: <strong>${Math.max(0, Math.floor(coins))}</strong>`;
}

function setStatus(message, tone = '') {
  statusMessage.textContent = message;
  statusMessage.classList.remove('warn', 'success');
  if (tone) statusMessage.classList.add(tone);
}

init();

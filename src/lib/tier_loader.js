const fs = require('fs');
const path = require('path');

const DEFAULT_DATA_PATH = path.join(__dirname, '..', 'data', 'tier_definitions.json');

function loadTierDefinitions(dataPath = DEFAULT_DATA_PATH) {
  const resolvedPath = path.resolve(dataPath);
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = JSON.parse(raw);
  validateTierData(parsed);
  return { ...parsed, _source: resolvedPath };
}

function validateTierData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Tier data must be an object.');
  }
  const attackTypes = asArray(data.attackTypes, 'attackTypes');
  const abilities = asArray(data.abilities, 'abilities');
  const lines = asArray(data.lines, 'lines');
  const attackIds = collectUniqueIds(attackTypes, 'attackTypes');
  const abilityIds = collectUniqueIds(abilities, 'abilities');

  if (lines.length !== 5) {
    throw new Error(`Expected 5 evolutionary lines, found ${lines.length}.`);
  }

  lines.forEach((line) => validateLine(line, attackIds, abilityIds));
  validateTranscendence(data.transcendence, abilityIds, attackIds);
  validateEnemyLines(data.enemyLines);
  validateBattlefield(data.battlefield);
}

function validateLine(line, attackIds, abilityIds) {
  if (!line.id || !line.name) {
    throw new Error('Each line requires id and name.');
  }
  const tiers = asArray(line.tiers, `${line.id}.tiers`);
  const tierNumbers = new Set(tiers.map((tier) => tier.tier));
  [1, 2, 3, 4].forEach((expected) => {
    if (!tierNumbers.has(expected)) {
      throw new Error(`Line ${line.id} is missing tier ${expected}.`);
    }
  });

  tiers.forEach((tier) => validateEntity(line.id, tier, attackIds, abilityIds));

  const finalGods = asArray(line.finalGods, `${line.id}.finalGods`);
  if (finalGods.length !== 4) {
    throw new Error(`Line ${line.id} must define exactly four final gods.`);
  }
  finalGods.forEach((god) => {
    if (god.tier !== 5) {
      throw new Error(`Final god ${god.id} on line ${line.id} must be tier 5.`);
    }
    validateEntity(line.id, god, attackIds, abilityIds);
    if (!god.archetype) {
      throw new Error(`Final god ${god.id} on line ${line.id} is missing an archetype.`);
    }
  });

  if (!line.mergeRule) {
    throw new Error(`Line ${line.id} must define a mergeRule.`);
  }
}

function validateEntity(lineId, entity, attackIds, abilityIds) {
  if (!entity.id || !entity.name) {
    throw new Error(`Entity on line ${lineId} is missing id or name.`);
  }
  if (!attackIds.has(entity.attackTypeId)) {
    throw new Error(`Entity ${entity.id} on line ${lineId} references unknown attackTypeId ${entity.attackTypeId}.`);
  }
  const abilities = asArray(entity.abilityIds || [], `${entity.id}.abilityIds`);
  abilities.forEach((abilityId) => {
    if (!abilityIds.has(abilityId)) {
      throw new Error(`Entity ${entity.id} on line ${lineId} references unknown abilityId ${abilityId}.`);
    }
  });
  validateStats(entity.stats, entity.id);
}

function validateTranscendence(transcendence, abilityIds, attackIds) {
  if (!transcendence) {
    throw new Error('Missing transcendence definition.');
  }
  if (typeof transcendence.requiresDistinctGodCount !== 'number' || transcendence.requiresDistinctGodCount < 1) {
    throw new Error('transcendence.requiresDistinctGodCount must be a positive number.');
  }
  if (!attackIds.has(transcendence.attackTypeId)) {
    throw new Error(`Transcendence references unknown attackTypeId ${transcendence.attackTypeId}.`);
  }
  const abilities = asArray(transcendence.abilityIds || [], 'transcendence.abilityIds');
  abilities.forEach((abilityId) => {
    if (!abilityIds.has(abilityId)) {
      throw new Error(`Transcendence references unknown abilityId ${abilityId}.`);
    }
  });
  validateStats(transcendence.stats, 'transcendence');
}

function validateEnemyLines(enemyLines) {
  const lines = asArray(enemyLines || [], 'enemyLines');
  if (lines.length < 1) {
    throw new Error('At least one enemy line is required.');
  }

  lines.forEach((line) => {
    if (!line.id || !line.name) {
      throw new Error('Each enemy line requires id and name.');
    }
    if (line.heartDamageOnExit !== 1) {
      throw new Error(`Enemy line ${line.id} must inflict exactly 1 heart on exit.`);
    }
    const units = asArray(line.units, `${line.id}.units`);
    if (units.length < 1) {
      throw new Error(`Enemy line ${line.id} must contain at least one unit.`);
    }

    units.forEach((unit) => {
      if (!unit.id || !unit.name) {
        throw new Error(`Enemy unit in ${line.id} is missing id or name.`);
      }
      if (typeof unit.health !== 'number' || unit.health <= 0) {
        throw new Error(`Enemy unit ${unit.id} in ${line.id} must define positive health.`);
      }
      if (typeof unit.defense !== 'number' || unit.defense < 0) {
        throw new Error(`Enemy unit ${unit.id} in ${line.id} must define non-negative defense.`);
      }
      if (!unit.speed) {
        throw new Error(`Enemy unit ${unit.id} in ${line.id} is missing speed.`);
      }
    });
  });
}

function validateBattlefield(battlefield) {
  if (!battlefield) {
    throw new Error('Battlefield configuration is required.');
  }
  const { gridWidth, gridHeight, enemyPath, buildableTiles } = battlefield;
  if (!Number.isInteger(gridWidth) || gridWidth <= 0 || !Number.isInteger(gridHeight) || gridHeight <= 0) {
    throw new Error('battlefield.gridWidth and battlefield.gridHeight must be positive integers.');
  }
  const path = asArray(enemyPath, 'battlefield.enemyPath');
  if (path.length < 2) {
    throw new Error('battlefield.enemyPath must include at least an entrance and escape.');
  }
  const pathKey = (tile) => `${tile.x},${tile.y}`;
  const seen = new Set();
  let escapeCount = 0;
  path.forEach((tile, idx) => {
    validateTile(tile, `battlefield.enemyPath[${idx}]`, gridWidth, gridHeight);
    const key = pathKey(tile);
    if (seen.has(key)) {
      throw new Error(`battlefield.enemyPath contains duplicate coordinate ${key}.`);
    }
    seen.add(key);
    if (tile.isEscape) escapeCount += 1;
  });
  if (escapeCount !== 1) {
    throw new Error('battlefield.enemyPath must mark exactly one escape tile.');
  }

  const buildTiles = asArray(buildableTiles, 'battlefield.buildableTiles');
  buildTiles.forEach((tile, idx) => {
    validateTile(tile, `battlefield.buildableTiles[${idx}]`, gridWidth, gridHeight);
    const key = pathKey(tile);
    if (seen.has(key)) {
      throw new Error(`Buildable tile ${key} overlaps the enemy path; build tiles must be off-path.`);
    }
  });
}

function validateTile(tile, label, gridWidth, gridHeight) {
  if (typeof tile !== 'object' || tile === null) {
    throw new Error(`${label} must be an object.`);
  }
  if (!Number.isInteger(tile.x) || !Number.isInteger(tile.y)) {
    throw new Error(`${label} requires integer x and y.`);
  }
  if (tile.x < 0 || tile.x >= gridWidth || tile.y < 0 || tile.y >= gridHeight) {
    throw new Error(`${label} is out of grid bounds.`);
  }
  if (tile.isEscape && tile.isAttackWindow === false) {
    throw new Error(`${label} escape tiles cannot disable attack windows flag.`);
  }
}

function validateStats(stats, ownerId) {
  if (!stats || typeof stats !== 'object') {
    throw new Error(`Stats missing for ${ownerId}.`);
  }
  const { range, attackPower, attackSpeed } = stats;
  if (typeof range !== 'number' || range <= 0) {
    throw new Error(`Stats.range must be a positive number for ${ownerId}.`);
  }
  if (typeof attackPower !== 'number' || attackPower <= 0) {
    throw new Error(`Stats.attackPower must be a positive number for ${ownerId}.`);
  }
  if (typeof attackSpeed !== 'number' || attackSpeed <= 0) {
    throw new Error(`Stats.attackSpeed must be a positive number for ${ownerId}.`);
  }
}

function asArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function collectUniqueIds(entries, label) {
  const ids = new Set();
  entries.forEach((entry) => {
    if (!entry.id) {
      throw new Error(`${label} entries require ids.`);
    }
    if (ids.has(entry.id)) {
      throw new Error(`${label} id ${entry.id} is duplicated.`);
    }
    ids.add(entry.id);
  });
  return ids;
}

function getLineById(data, lineId) {
  return (data.lines || []).find((line) => line.id === lineId) || null;
}

function listFinalGods(data) {
  return (data.lines || []).flatMap((line) => line.finalGods || []);
}

function findEntityById(data, entityId) {
  for (const line of data.lines || []) {
    const tierMatch = (line.tiers || []).find((tier) => tier.id === entityId);
    if (tierMatch) return tierMatch;
    const godMatch = (line.finalGods || []).find((god) => god.id === entityId);
    if (godMatch) return godMatch;
  }
  return null;
}

function getTranscendenceRule(data) {
  return data.transcendence || null;
}

function listEnemyUnits(data) {
  return (data.enemyLines || []).flatMap((line) => line.units || []);
}

function getEnemyLineById(data, lineId) {
  return (data.enemyLines || []).find((line) => line.id === lineId) || null;
}

function getEnemyById(data, enemyId) {
  for (const line of data.enemyLines || []) {
    const match = (line.units || []).find((unit) => unit.id === enemyId);
    if (match) return match;
  }
  return null;
}

function getBattlefield(data) {
  return data.battlefield || null;
}

function getEnemyPath(data) {
  return (data.battlefield && data.battlefield.enemyPath) || [];
}

function listBuildableTiles(data) {
  return (data.battlefield && data.battlefield.buildableTiles) || [];
}

function listAttackWindows(data) {
  return getEnemyPath(data).filter((tile) => tile.isAttackWindow);
}

module.exports = {
  DEFAULT_DATA_PATH,
  loadTierDefinitions,
  getLineById,
  listFinalGods,
  findEntityById,
  getTranscendenceRule,
  listEnemyUnits,
  getEnemyLineById,
  getEnemyById,
  getBattlefield,
  getEnemyPath,
  listBuildableTiles,
  listAttackWindows,
};

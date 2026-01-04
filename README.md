# td-merge

Tiered evolution merge game content definitions.

## Tier data
- Design reference: [`docs/tier_system.md`](docs/tier_system.md) lists every tier, line, attack type, ability, and the transcendence rule (four distinct gods + catalyst → Transcendent Concord).
- Source data: [`src/data/tier_definitions.json`](src/data/tier_definitions.json) mirrors the design document. It covers five evolutionary lines, four god archetypes per line, and the transcendence entry.
- Enemies: The same data file also defines path-walking hero invaders (no attacks, 1 heart on exit) for enemy wave composition.
- Battlefield: A `battlefield` layout lists the enemy path (with attack window tiles and the escape tile) plus off-path buildable
  tiles for spawning player units.

## Playable prototype
- Requirements: install Node 18+ and run `npm install` (listed in [`requirements/npm.txt`](requirements/npm.txt)).
- Start the GUI: `npm start` will serve `/public` and expose tier data via `/api/tier-data`.
- How to play:
  - Use the **Line** selector to choose a tier-1 unit to place.
  - Click any green buildable tile to place the unit; select a placed tower and click **Upgrade Selected** to advance along its line (each upgrade boosts range, attack power, and attack speed from the tier data).
  - Press **Start** to spawn path-walking invaders; towers auto-attack enemies in attack-window path tiles. Losing all hearts ends the run; **Reset** restarts the battlefield.

## Loading the data
`src/lib/tier_loader.js` validates and exposes the tier data for gameplay systems:

```js
const {
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
} = require('./src/lib/tier_loader');

const tierData = loadTierDefinitions(); // Throws if the JSON is invalid or incomplete.
const solarLine = getLineById(tierData, 'solar');
const finalGods = listFinalGods(tierData);
const emberParagon = findEntityById(tierData, 'ember-paragon');
const transcendence = getTranscendenceRule(tierData);
const heroInvaders = getEnemyLineById(tierData, 'hero-invaders');
const allEnemyUnits = listEnemyUnits(tierData);
const valiantParagon = getEnemyById(tierData, 'valiant-paragon');
const battlefield = getBattlefield(tierData);
const enemyPath = getEnemyPath(tierData);
const attackWindows = listAttackWindows(tierData);
const buildable = listBuildableTiles(tierData);
```

### Validation rules
- Fails load if any attack type or ability reference is missing.
- Requires five lines with tiers 1–4 populated and exactly four tier-5 gods per line.
- Ensures transcendence points to valid abilities and the omni-element attack type.
- Requires at least one enemy line; each must inflict 1 heart on exit, define health/defense, and never attack.
- Enforces stats (range, attack power, attack speed) on every evolvable unit and transcendence.
- Validates `battlefield` grid bounds, the unique enemy path with a single escape tile, and buildable tiles that never overlap the
  enemy path.

### Extending the data
- Add new abilities or attack types first, then reference their IDs from entities.
- Keep identifiers stable; gameplay systems rely on them for merging and combat logic.
- Update the design document if you introduce new lines or archetypes so documentation stays authoritative.

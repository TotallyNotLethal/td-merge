# Tier System Design

This document defines the five-tier evolutionary system, including every line, ability, attack type, and the transcendence rule used by gameplay systems.

## Overview
- **Tiers:** 1 through 5. Tiers 1–4 are linear evolutions; tier 5 is a selectable god form chosen from four archetypes per line.
- **Evolutionary lines:** Five thematic lines — Solar, Lunar, Tidal, Verdant, and Umbral. Each line has one entity per tier for tiers 1–4 and four alternative gods at tier 5 (20 gods total).
- **Abilities and attack types:** Each entity lists its attack type and abilities. Abilities are reusable between evolutions within a line.
- **Transcendence rule:** When any four distinct gods (from any lines) are merged with a Transcendence Catalyst, they fuse into **Transcendent Concord**, unlocking the omni-element attack type and transcendence abilities. The catalyst is consumed, and the participating gods are replaced by the transcendent form.

## Evolutionary Lines and Tiers
For each line, tiers 1–4 evolve sequentially. Tier 5 is selected by merging the tier-4 form with a catalyst aligned to the desired archetype (Assault, Bastion, Control, or Wildcard). All names below must be mirrored in data.

**Stat growth:** Every upgrade (merge) increases combat performance. Unless a god specifies a deviation, tiers grow with these baselines:

- Tier 1 → Tier 2: modest improvements (range +0.5, attack power +6, attack speed +0.1 attacks/sec).
- Tier 2 → Tier 3: steady improvements (range +0.5, attack power +8, attack speed +0.1).
- Tier 3 → Tier 4: strong improvements (range +0.5, attack power +9, attack speed +0.1).
- Tier 4 → Tier 5: apex improvements (range +1.0, attack power +15+, attack speed +0.15+ depending on archetype).
- Transcendence outranks all gods (further +0.5 range, +10 attack power, +0.15 attack speed from god baselines).

### Solar Line
- **Tier 1:** Sun Spark — Attack: Radiant Beam; Ability: Sun-Kissed Warmth.
- **Tier 2:** Ember Squire — Attack: Solar Edge; Ability: Blazing Guard.
- **Tier 3:** Zenith Knight — Attack: Solar Barrage; Ability: Heliotropic Charge.
- **Tier 4:** Dawn Warden — Attack: Coronal Lance; Abilities: Flarewall Bulwark, Phoenix Aegis.
- **Tier 5 Gods:**
  - Auric Judge (Bastion) — Attack: Stellar Hammer; Abilities: Solar Liturgy, Flarewall Bulwark, Auric Edict.
  - Helion Admiral (Assault) — Attack: Dawn Fleet Barrage; Abilities: Phoenix Aegis, Solar Liturgy, Radiant Command.
  - Solarii Oracle (Control) — Attack: Prismatic Ray; Abilities: Heliotropic Charge, Lightwell Oracle, Guiding Aperture.
  - Ember Paragon (Wildcard) — Attack: Corona Burst; Abilities: Coronal Breach, Sun Ascension, Adaptive Flare.

### Lunar Line
- **Tier 1:** Moon Sprout — Attack: Lunar Shard; Ability: Crescent Scout.
- **Tier 2:** Silver Acolyte — Attack: Silver Blades; Ability: Crescent Step.
- **Tier 3:** Eclipse Ranger — Attack: Shadow Arrow; Ability: Eclipse Mark.
- **Tier 4:** Night Herald — Attack: Umbral Surge; Abilities: Veil of Night, Gravity Bind.
- **Tier 5 Gods:**
  - Selene Matriarch (Bastion) — Attack: Moon Bastion Spear; Abilities: Veil of Night, Tidal Silence, Silver Mandate.
  - Eclipse Emperor (Assault) — Attack: Eclipse Lance; Abilities: Eclipse Mark, Lunar Blitz, Darkling Volley.
  - Noctis Weaver (Control) — Attack: Thread of Dusk; Abilities: Gravity Bind, Quiet Dominion, Dream Snare.
  - Argent Trickster (Wildcard) — Attack: Mirror Flurry; Abilities: Crescent Step, Mirage Bloom, Lunar Gambit.

### Tidal Line
- **Tier 1:** Tide Minnow — Attack: Aqua Dart; Ability: Ripple Dash.
- **Tier 2:** Current Binder — Attack: Tidal Whip; Ability: Undertow Grapple.
- **Tier 3:** Storm Corsair — Attack: Tempest Shot; Ability: Waveburst Rally.
- **Tier 4:** Abyss Captain — Attack: Maelstrom Cleave; Abilities: Abyssal Anchor, Foam Bastion.
- **Tier 5 Gods:**
  - Leviathan Sovereign (Bastion) — Attack: Leviathan Crush; Abilities: Foam Bastion, Tidal Bulwark, Abyss Crown.
  - Tempest Navigator (Assault) — Attack: Cyclone Javelin; Abilities: Waveburst Rally, Current Reversal, Typhoon Line.
  - Coral Judge (Control) — Attack: Reef Spire; Abilities: Undertow Grapple, Tide Court, Brackish Decree.
  - Brine Seer (Wildcard) — Attack: Abyssal Verse; Abilities: Ripple Dash, Depth Echo, Fathom Insight.

### Verdant Line
- **Tier 1:** Seedling Scout — Attack: Thorn Dart; Ability: Photosynthetic Bloom.
- **Tier 2:** Grove Skirmisher — Attack: Briar Sling; Ability: Vine Snare.
- **Tier 3:** Canopy Warden — Attack: Spore Burst; Ability: Canopy Guard.
- **Tier 4:** Wildwood Shaper — Attack: Root Quake; Abilities: Pollen Shield, Verdant Surge.
- **Tier 5 Gods:**
  - Primeval Titan (Assault) — Attack: Gaia Breaker; Abilities: Verdant Surge, Earthshaker Cry, Ivy Rampage.
  - Bloom Architect (Control) — Attack: Lattice Beam; Abilities: Pollen Shield, Bloom Lattice, Habitat Rewrite.
  - Thorn Regent (Bastion) — Attack: Regent's Thorn; Abilities: Vine Snare, Crown of Briars, Bulwark Blossom.
  - Sylvan Whisperer (Wildcard) — Attack: Sylvan Pulse; Abilities: Photosynthetic Bloom, Forest's Voice, Green Mirage.

### Umbral Line
- **Tier 1:** Ash Wisp — Attack: Ember Spit; Ability: Smoke Drift.
- **Tier 2:** Cinder Stalker — Attack: Char Fang; Ability: Ember Step.
- **Tier 3:** Shadow Blade — Attack: Dusk Slash; Ability: Shadow Feint.
- **Tier 4:** Void Templar — Attack: Abyss Edge; Abilities: Null Screen, Entropy Mark.
- **Tier 5 Gods:**
  - Oblivion Tyrant (Assault) — Attack: Oblivion Scythe; Abilities: Entropy Mark, Ruinous Sweep, Eventide Howl.
  - Rift Arcanist (Control) — Attack: Rift Spiral; Abilities: Null Screen, Rift Script, Vacuole Bind.
  - Dread Marshal (Bastion) — Attack: Dread Banner; Abilities: Shadow Feint, Marshal's Bulwark, Night Rally.
  - Veil Reclaimer (Wildcard) — Attack: Veil Fold; Abilities: Smoke Drift, Cinder Memory, Quiet Return.

## Attack Types
All referenced attack types are defined here and mirrored in data:
- Radiant Beam, Solar Edge, Solar Barrage, Coronal Lance, Stellar Hammer, Dawn Fleet Barrage, Prismatic Ray, Corona Burst.
- Lunar Shard, Silver Blades, Shadow Arrow, Umbral Surge, Moon Bastion Spear, Eclipse Lance, Thread of Dusk, Mirror Flurry.
- Aqua Dart, Tidal Whip, Tempest Shot, Maelstrom Cleave, Leviathan Crush, Cyclone Javelin, Reef Spire, Abyssal Verse.
- Thorn Dart, Briar Sling, Spore Burst, Root Quake, Gaia Breaker, Lattice Beam, Regent's Thorn, Sylvan Pulse.
- Ember Spit, Char Fang, Dusk Slash, Abyss Edge, Oblivion Scythe, Rift Spiral, Dread Banner, Veil Fold.
- Omni Convergence (transcendence).

## Abilities
Abilities are reusable components referenced by entities and must remain consistent with the data model:
- Sun-Kissed Warmth, Blazing Guard, Heliotropic Charge, Flarewall Bulwark, Phoenix Aegis, Solar Liturgy, Auric Edict, Radiant Command, Lightwell Oracle, Guiding Aperture, Coronal Breach, Sun Ascension, Adaptive Flare.
- Crescent Scout, Crescent Step, Eclipse Mark, Veil of Night, Gravity Bind, Tidal Silence, Silver Mandate, Lunar Blitz, Darkling Volley, Quiet Dominion, Dream Snare, Mirage Bloom, Lunar Gambit.
- Ripple Dash, Undertow Grapple, Waveburst Rally, Abyssal Anchor, Foam Bastion, Tidal Bulwark, Abyss Crown, Current Reversal, Typhoon Line, Tide Court, Brackish Decree, Depth Echo, Fathom Insight.
- Photosynthetic Bloom, Vine Snare, Canopy Guard, Pollen Shield, Verdant Surge, Earthshaker Cry, Ivy Rampage, Bloom Lattice, Habitat Rewrite, Crown of Briars, Bulwark Blossom, Forest's Voice, Green Mirage.
- Smoke Drift, Ember Step, Shadow Feint, Null Screen, Entropy Mark, Ruinous Sweep, Eventide Howl, Rift Script, Vacuole Bind, Marshal's Bulwark, Night Rally, Cinder Memory, Quiet Return.
- Meta-Weave, Timeline Braid, Concordant Pulse (transcendence abilities).

## Transcendence Rule
- Requirement: Merge any **four distinct gods** (tier-5 entities) with a **Transcendence Catalyst**.
- Result: The four gods are consumed and replaced by **Transcendent Concord**.
- Transcendent Concord uses the **Omni Convergence** attack type and gains the **Meta-Weave**, **Timeline Braid**, and **Concordant Pulse** abilities.
- Gameplay systems must respect uniqueness (four different god IDs) when validating the merge.

## Data Model Parity
- Data lives in `src/data/tier_definitions.json` and follows the structure consumed by `src/lib/tier_loader.js`.
- Every name, attack type, and ability listed here is represented in the data file with matching identifiers.

## Path-Walking Enemies
Heroes who march along the path and must be defeated before reaching the exit. They **do not attack**; if any reaches
the exit, the player loses **1 heart**. Health and defense scale across the line, and the data mirrors the entries below
under `enemyLines` in `src/data/tier_definitions.json`.

- **Hero Invader Line** (heart damage on exit: 1, behavior: walks the path, never attacks)
  - Runeguard Page — Health: 120; Defense: 5; Speed: Steady.
  - Crest Sellsword — Health: 180; Defense: 10; Speed: Steady.
  - Banner Champion — Health: 250; Defense: 18; Speed: Steady.
  - Sanctum Marshal — Health: 320; Defense: 26; Speed: Steady.
  - Valiant Paragon — Health: 400; Defense: 34; Speed: Steady.

## Paths, Buildable Tiles, and Attack Windows
- **Enemy path:** Invaders follow a dedicated path from an entrance to an escape tile. If any reaches escape, 1 heart is lost.
- **Non-walkable spawn tiles:** Player units spawn only on buildable tiles that are explicitly off the enemy path.
- **Attack tiles on the path:** Specific path tiles are marked as attack windows to guarantee coverage along the route.
- **Data shape:** A `battlefield` section enumerates the enemy path waypoints (including which are attack windows), the escape
  tile, and the list of buildable tiles for player placement.

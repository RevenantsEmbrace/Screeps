# Scouting Data Format

This document defines the structure and purpose of `Memory.scouting`, used to track information about explored rooms for remote mining, expansion, and strategic decisions.

---

## Structure Overview

```js
Memory.scouting = {
    [roomName]: {
        lastScouted: Game.time,
        terrain: { plain, swamp, wall },
        exits: {
            top:    { leadsTo, size, coords: [ { x, y } ] },
            right:  { leadsTo, size, coords: [ { x, y } ] },
            bottom: { leadsTo, size, coords: [ { x, y } ] },
            left:   { leadsTo, size, coords: [ { x, y } ] }
        },
        controller: {
            x, y, level, owner, reservation
        },
        sources: [
            { x, y, miningSpots }
        ],
        resources: [
            { type, x, y, miningSpots }
        ],
        hostileStructures: [ "tower", "spawn", ],
        threatLevel: "NONE" | "LOW" | "HIGH",
        spawnCandidate: true | false,
        scores: {
            remoteHarvestScore: Number,
            defensiveScore: Number,
            dangerScore: Number,
            potential: Number
        }
    }
}
```

---

## Field Descriptions

### lastScouted
Tick when the room was last updated. Used to prioritize fresh scouting.

### terrain
Counts of tile types:
```json
{ "plain": 310, "swamp": 90, "wall": 150 }
```

### exits
Each direction (`top`, `right`, `bottom`, `left`) includes:
- `leadsTo`: name of the adjacent room
- `size`: number of walkable tiles
- `coords`: list of tile positions along that edge

### controller
Details about the room's controller, if it exists:
```json
{ "x": 24, "y": 22, "level": 3, "owner": "Enemy", "reservation": null }
```

### sources
Energy sources with estimated number of mining positions.

### resources
Minerals (e.g. H, U, Z) with position and nearby mining space.

### hostileStructures
Array of hostile structures seen during the last scout.

### threatLevel
Quick visual status: `"NONE"`, `"LOW"`, or `"HIGH"`

### spawnCandidate
Boolean value indicating if this room is a possible colony target.

---

## Scores

This section contains several numeric ratings used to evaluate room value and risk. These values may evolve with additional scouting and AI refinement.

### remoteHarvestScore
- Lower is better.
- Calculated as the shortest path distance from the closest owned spawn/storage to each energy source.
- Rooms adjacent to owned rooms may have scores as low as 10–20.
- High values (e.g. >150) indicate inefficiency or isolation.

### defensiveScore
- Lower is better.
- Indicates how difficult the room is to defend, based on exit sizes, terrain, and defense layout.
- Calculated using your defense strategy (e.g. chokepoints, bunker design).
- Includes number of defensive buildings needed (walls, ramparts, towers, etc.).

### dangerScore
- Higher is more dangerous.
- Factors include:
    - Active hostile creeps or NPC invaders
    - Hostile structures
    - Nearby player presence (from exits)
    - Claimed/reserved status
- Can be scaled (e.g. 0–10) to enable comparisons.

### potential
- Composite score based on:
    - `remoteHarvestScore` (low is good)
    - `defensiveScore` (low is good)
    - `dangerScore` (low is good)
- Designed to assist in ranking rooms for claiming, attacking, or avoiding.
- Formula TBD depending on strategic priorities (e.g. high-value vs low-risk).

---

## Planned Additions

- `defensiveScore` strategy module
- `roomPlan` references for owned/target rooms
- `lastSeenHostile` timestamp
- Expansion priority queue based on `potential`

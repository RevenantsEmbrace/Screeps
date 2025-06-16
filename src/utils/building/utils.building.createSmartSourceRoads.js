/**
 * utils.utils.building.createSmartSourceRoads.js
 *
 * Creates smart roads:
 * - Connects spawn to accessible tiles around each source
 * - Connects those tiles to each other
 * - Skips if any construction sites already exist
 */

module.exports = function createSmartSourceRoads(room) {
    // Don't run if there's any active construction
    if (room.find(FIND_CONSTRUCTION_SITES).length > 0) return;

    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) return;

    const spawn = spawns[0];
    const sources = room.find(FIND_SOURCES);

    for (const source of sources) {
        const openTiles = [];

        // Step 1: Find all walkable adjacent tiles
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                const x = source.pos.x + dx;
                const y = source.pos.y + dy;

                if (room.getTerrain().get(x, y) !== TERRAIN_MASK_WALL) {
                    openTiles.push(new RoomPosition(x, y, room.name));
                }
            }
        }

        // Step 2: Build roads from spawn to each open tile if path exists
        for (const tile of openTiles) {
            const pathToTile = room.findPath(spawn.pos, tile, { ignoreCreeps: true, maxOps: 300 });

            if (pathToTile.length > 0) {
                for (const step of pathToTile) {
                    const hasRoad = room.lookAt(step.x, step.y).some(i =>
                        (i.structure && i.structure.structureType === STRUCTURE_ROAD) ||
                        (i.constructionSite && i.constructionSite.structureType === STRUCTURE_ROAD)
                    );

                    if (!hasRoad && room.getTerrain().get(step.x, step.y) !== TERRAIN_MASK_WALL) {
                        room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                    }
                }
            }
        }

        // Step 3: Connect all openTiles to each other
        for (let i = 0; i < openTiles.length; i++) {
            for (let j = i + 1; j < openTiles.length; j++) {
                const path = room.findPath(openTiles[i], openTiles[j], { ignoreCreeps: true, maxOps: 200 });

                if (path.length > 0) {
                    for (const step of path) {
                        const hasRoad = room.lookAt(step.x, step.y).some(i =>
                            (i.structure && i.structure.structureType === STRUCTURE_ROAD) ||
                            (i.constructionSite && i.constructionSite.structureType === STRUCTURE_ROAD)
                        );

                        if (!hasRoad && room.getTerrain().get(step.x, step.y) !== TERRAIN_MASK_WALL) {
                            room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                        }
                    }
                }
            }
        }
    }
};
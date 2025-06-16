function getAvailableSources(room) {
    const terrain = Game.map.getRoomTerrain(room.name);
    const sources = room.find(FIND_SOURCES);

    const sourceData = sources.map(source => {
        let freeSpots = 0;
        const { x, y } = source.pos;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const tile = terrain.get(x + dx, y + dy);
                if (tile !== TERRAIN_MASK_WALL) {
                    freeSpots++;
                }
            }
        }

        return {
            id: source.id,
            pos: source.pos,
            freeSpots,
            assignedCreeps: 0
        };
    });

    // Count creep assignments
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.sourceId) {
            const entry = sourceData.find(s => s.id === creep.memory.sourceId);
            if (entry) entry.assignedCreeps++;
        }
    }

    return sourceData;
}

function assignOptimalSource(creep) {
    const sources = getAvailableSources(creep.room);
    const viable = sources.filter(s => s.assignedCreeps < s.freeSpots);

    if (!viable.length) return null;

    const closest = creep.pos.findClosestByPath(viable.map(s => Game.getObjectById(s.id)));
    if (closest) {
        creep.memory.sourceId = closest.id;
        return closest;
    }

    return null;
}

function getAssignedSource(creep) {
    let source = Game.getObjectById(creep.memory.sourceId);

    if (!source || source.energy === 0) {
        source = assignOptimalSource(creep);
    }

    return source;
}

module.exports = {
    getAvailableSources,
    assignOptimalSource,
    getAssignedSource
};

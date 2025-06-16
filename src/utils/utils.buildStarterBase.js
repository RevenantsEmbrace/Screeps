const starterBase = require('templates.starterBase');

function buildStarterBase(room) {
    if (!room.controller || !room.controller.my) return;

    // Skip if any construction is in progress
    const activeSites = room.find(FIND_CONSTRUCTION_SITES);
    if (activeSites.length > 0) return;

    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) return;

    const center = spawns[0].pos;
    const rcl = room.controller.level;
    const layout = starterBase.buildings;

    for (const structureType in layout) {
        for (const offset of layout[structureType]) {
            const x = center.x + offset.dx;
            const y = center.y + offset.dy;

            const occupied = room.lookAt(x, y).some(obj =>
                (obj.structure && obj.structure.structureType === structureType) ||
                (obj.constructionSite && obj.constructionSite.structureType === structureType)
            );

            if (!occupied) {
                room.createConstructionSite(x, y, structureType);
            }
        }
    }
}

module.exports = buildStarterBase;

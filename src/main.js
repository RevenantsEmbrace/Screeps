const SpawnManager = require('managers.spawnManager');
const roleHarvester = require('roles.harvester');

module.exports.loop = function () {
    // Memory cleanup
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) delete Memory.creeps[name];
    }

    // === Ensure at least one Harvester exists ===
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'HRV');
    if (harvesters.length === 0) {
        SpawnManager.request({
            role: 'HRV',
            body: [WORK, CARRY, MOVE],
            designation: 'AUXIA-HRV-001',
            requester: 'System',
            requesterId: null,
            targetRoom: Object.values(Game.spawns)[0]?.room.name || 'W0N0'
        });
    }

    // === Process spawn queue ===
    SpawnManager.processQueue();

    // === Creep role logic ===
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === 'HRV') {
            roleHarvester.run(creep);
        }
    }
};

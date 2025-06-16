const creepTemplates = require('utils.creepTemplates');
const Naming = require('utils.naming');

const SpawnManager = {
    request: function(order) {
        if (!Memory.spawnQueue) Memory.spawnQueue = [];
        Memory.spawnQueue.push(order);
    },

    processQueue: function() {
        if (!Memory.spawnQueue || Memory.spawnQueue.length === 0) return;

        for (const spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (spawn.spawning) continue;

            const queue = Memory.spawnQueue;

            for (let i = 0; i < queue.length; i++) {
                const order = queue[i];
                if (order.targetRoom && spawn.room.name !== order.targetRoom) continue;

                // === Template Selection ===
                const templates = creepTemplates[order.role];
                if (!templates || templates.length === 0) {
                    console.log(`[Spawn] No templates defined for role: ${order.role}`);
                    queue.splice(i, 1);
                    break;
                }

                // Find best affordable template
                const availableEnergy = spawn.room.energyAvailable;
                const chosenTemplate = templates
                    .filter(t => _.sum(t.body.map(part => BODYPART_COST[part])) <= availableEnergy)
                    .sort((a, b) =>
                        _.sum(b.body.map(p => BODYPART_COST[p])) -
                        _.sum(a.body.map(p => BODYPART_COST[p]))
                    )[0];

                if (!chosenTemplate) {
                    // Not enough energy for any template
                    continue;
                }

                const designation = order.designation || Naming.generateAuxDesignation(order.role);
                const memoryPayload = {
                    role: order.role
                };

                if (order.targetRoom) {
                    memoryPayload.targetRoom = order.targetRoom;
                }

                const result = spawn.spawnCreep(chosenTemplate.body, designation, {
                    memory: memoryPayload
                });

                if (result === OK) {
                    console.log(`[Spawn] ${spawn.name} spawned ${designation} (${order.role}) using template: ${chosenTemplate.name}`);
                    queue.splice(i, 1);
                    break;
                } else if (result !== ERR_BUSY && result !== ERR_NOT_ENOUGH_ENERGY) {
                    console.log(`[Spawn] Failed to spawn ${designation}: ${result}`);
                    queue.splice(i, 1);
                    break;
                }
            }
        }
    }
};

module.exports = SpawnManager;

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

                // Match spawn's room with the targetRoom (if specified)
                if (order.targetRoom && spawn.room.name !== order.targetRoom) continue;

                const result = spawn.spawnCreep(order.body, order.designation, {
                    memory: {
                        role: order.role,
                        requester: order.requester,
                        requesterId: order.requesterId,
                        targetRoom: order.targetRoom || spawn.room.name,
                        targetId: order.targetId || null
                    }
                });

                if (result === OK) {
                    console.log(`[Spawn] ${spawn.name} spawned ${order.designation} (${order.role}) requested by ${order.requester}`);
                    queue.splice(i, 1);
                    break;
                } else if (result !== ERR_BUSY && result !== ERR_NOT_ENOUGH_ENERGY) {
                    console.log(`[Spawn] Failed to spawn ${order.designation}: ${result}`);
                    queue.splice(i, 1); // remove bad order
                    break;
                }
            }
        }
    }
};

module.exports = SpawnManager;

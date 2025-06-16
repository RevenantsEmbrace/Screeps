/**
 * role.hauler.js
 * ------------------
 * Role: Hauler (HLR)
 * Task: Transfer energy to structures
 * Reverts to original role task when out of energy
 */

const roleHauler = {
    run(creep) {
        if (!creep.memory.task) {
            creep.memory.task = 'hauling';
        }

        // If empty, revert to original task
        if (creep.memory.task === 'hauling' && creep.store[RESOURCE_ENERGY] === 0) {
            const roleCode = creep.name.split('-')[1]; // e.g. HRV, UPG, BLD, REP

            switch (roleCode) {
                case 'HRV':
                    creep.memory.task = 'harvesting';
                    break;
                case 'UPG':
                case 'BLD':
                case 'REP':
                    creep.memory.task = 'fetching';
                    break;
                default:
                    creep.memory.task = 'fetching';
            }
            return;
        }

        // Find things that need energy (spawn, extensions, towers)
        const targets = creep.room.find(FIND_STRUCTURES, {
            filter: s =>
                (s.structureType === STRUCTURE_EXTENSION ||
                    s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_TOWER) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (targets.length > 0) {
            const target = creep.pos.findClosestByPath(targets);
            if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            // Nothing to haul to — idle near spawn or storage
            const fallback = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
            if (fallback) creep.moveTo(fallback, { visualizePathStyle: { stroke: '#888888' } });
        }
    }
};

module.exports = roleHauler;

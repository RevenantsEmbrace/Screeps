/**
 * role.upgrader.js
 * ------------------
 * Role: Upgrader (UPG)
 * Primary: Upgrade the controller
 * Fallback: Hauler (if nothing to upgrade)
 * Reverts to original task on empty
 */

const roleHauler = require('roles.hauler');

const roleUpgrader = {
    run(creep) {
        if (!creep.memory.task) {
            creep.memory.task = 'fetching';
        }

        if (creep.memory.task === 'fetching' && creep.store.getFreeCapacity() === 0) {
            creep.memory.task = 'upgrading';
        }

        if (creep.memory.task === 'upgrading' && creep.store[RESOURCE_ENERGY] === 0) {
            // Revert to original role's task using name
            const roleCode = creep.name.split('-')[1];

            switch (roleCode) {
                case 'HRV':
                    creep.memory.task = 'harvesting';
                    break;
                case 'BLD':
                case 'REP':
                case 'UPG':
                default:
                    creep.memory.task = 'fetching';
                    break;
            }
            return;
        }

        if (creep.memory.task === 'fetching') {
            const sources = creep.room.find(FIND_STRUCTURES, {
                filter: s =>
                    (s.structureType === STRUCTURE_CONTAINER ||
                        s.structureType === STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 0
            });

            const source = creep.pos.findClosestByPath(sources);

            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                // Fallback to harvesting
                const fallback = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (fallback && creep.harvest(fallback) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(fallback, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
            return;
        }

        if (creep.memory.task === 'upgrading') {
            // Try to upgrade controller
            if (creep.room.controller) {
                const result = creep.upgradeController(creep.room.controller);

                if (result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                } else if (result !== OK) {
                    // Can't upgrade → fallback to hauling behavior
                    roleHauler.run(creep);
                }
            } else {
                // No controller → fallback
                roleHauler.run(creep);
            }
        }
    }
};

module.exports = roleUpgrader;

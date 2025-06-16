/**
 * role.repairer.js
 * ------------------
 * Role: Repairer (REP)
 *
 * Repairs damaged structures.
 * Fallback: Directly runs upgrader behavior when no repairs needed.
 * Reverts to fetching when out of energy.
 */

const roleUpgrader = require('roles.upgrader');

const roleRepairer = {
    run(creep) {
        if (!creep.memory.task) {
            creep.memory.task = 'fetching';
        }

        if (creep.memory.task === 'fetching' && creep.store.getFreeCapacity() === 0) {
            creep.memory.task = 'repairing';
        }

        if (creep.memory.task === 'repairing' && creep.store[RESOURCE_ENERGY] === 0) {
            // Revert to original role's task using name
            const roleCode = creep.name.split('-')[1];

            switch (roleCode) {
                case 'HRV':
                    creep.memory.task = 'harvesting';
                    break;
                case 'BLD':
                case 'REP':
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
                const fallback = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (fallback && creep.harvest(fallback) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(fallback, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }

            return;
        }

        if (creep.memory.task === 'repairing') {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: s =>
                    s.hits < s.hitsMax &&
                    s.structureType !== STRUCTURE_WALL &&
                    s.structureType !== STRUCTURE_RAMPART
            });

            if (targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if (target && creep.repair(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            } else {
                // Fallback to upgrader logic only
                creep.memory.task = 'upgrading';
                roleUpgrader.run(creep);
            }
        }

        if(creep.memory.task === 'upgrading') {
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleRepairer;

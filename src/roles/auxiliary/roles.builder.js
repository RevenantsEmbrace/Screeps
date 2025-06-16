/**
 * role.builder.js
 * ------------------
 * Role: Builder (BLD)
 *
 * Builds construction sites.
 * Fallback: Runs repairer logic if no build targets.
 * Reverts to fetching when energy is depleted.
 */

const roleRepairer = require('roles.repairer');
const roleUpgrader = require("./roles.upgrader");

const roleBuilder = {
    run(creep) {
        if (!creep.memory.task) {
            creep.memory.task = 'fetching';
        }

        // Switch to building when full
        if (creep.memory.task === 'fetching' && creep.store.getFreeCapacity() === 0) {
            creep.memory.task = 'building';
        }

        // Reset to fetching if energy is empty
        if (creep.memory.task === 'building' && creep.store[RESOURCE_ENERGY] === 0) {
            // Revert to original role's task using name
            const roleCode = creep.name.split('-')[1];

            switch (roleCode) {
                case 'HRV':
                    creep.memory.task = 'harvesting';
                    break;
                case 'BLD':
                default:
                    creep.memory.task = 'fetching';
                    break;
            }
            return;
        }

        // FETCHING
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

        // BUILDING
        if (creep.memory.task === 'building') {
            const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (sites.length > 0) {
                const site = creep.pos.findClosestByPath(sites);
                if (site && creep.build(site) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                // Nothing to build → run repairer logic
                creep.memory.task = 'repairing';
                roleRepairer.run(creep);
            }
        }

        if(creep.memory.task === 'repairing') {
            roleRepairer.run(creep);
        }

        if(creep.memory.task === 'upgrading') {
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleBuilder;

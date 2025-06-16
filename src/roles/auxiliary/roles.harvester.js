/**
 * role.harvester.js
 * ------------------
 * Role: Harvester (HRV)
 *
 * Harvests energy from sources and delivers it to containers/spawns/extensions.
 * Fallback: Becomes an Upgrader when nothing needs energy.
 * Reverts to harvesting after upgrading ends.
 */

const roleBuilder = require('roles.builder');
const roleRepairer = require('roles.repairer');
const roleUpgrader = require('roles.upgrader');
const SourceAssignment = require('utils.creep.sourceAssignment'); // assumes your utility file is named this

const roleHarvester = {
    run(creep) {
        if (!creep.memory.task) {
            creep.memory.task = 'harvesting';
        }

        if (creep.memory.task === 'harvesting' && creep.store.getFreeCapacity() === 0) {
            creep.memory.task = 'delivering';
        }

        if (creep.memory.task === 'delivering' && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.task = 'harvesting';
            return;
        }

        if (creep.memory.task === 'harvesting') {
            // 1. Pick up dropped energy first
            const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
            });

            if (dropped) {
                if (creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped, { visualizePathStyle: { stroke: '#00ff00' } });
                }
                return;
            }

            // 2. Withdraw from containers/storage
            const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s =>
                    (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 50
            });

            if (containers) {
                if (creep.withdraw(containers, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }

            // 3. Fallback to harvesting from assigned source
            const source = SourceAssignment.getAssignedSource(creep);
            if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ff8800' } });
            }

            return;
        }

        // DELIVERING
        if (creep.memory.task === 'delivering') {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: s =>
                    (s.structureType === STRUCTURE_CONTAINER ||
                        s.structureType === STRUCTURE_SPAWN ||
                        s.structureType === STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                // No delivery targets → fallback to upgrader
                creep.memory.task = 'building';
                roleBuilder.run(creep);
            }
        }

        if(creep.memory.task === 'building') {
            roleBuilder.run(creep);
        }

        if (creep.memory.task === 'repairing') {
            roleRepairer.run(creep);
        }

        if(creep.memory.task === 'upgrading') {
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleHarvester;

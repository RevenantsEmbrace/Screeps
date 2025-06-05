/**
 * roles.harvester.js
 * ------------------
 * Role: Harvester (HRV)
 *
 * Purpose:
 *   - Harvests energy from the nearest source.
 *   - Transfers energy based on this priority:
 *     1. Nearest container (if available and not full)
 *     2. Spawn (if not full)
 *     3. Extensions (if any have space)
 *     4. If all full → fallback to Hauler (HLR)
 *
 * Scalability:
 *   - Works from Room Level 1 onward.
 *   - No dependencies on containers or links.
 *   - Compatible with remote harvesting assignment if upgraded.
 *
 * Naming Format:
 *   AUX##-HRV-XXX (e.g., AUX00-HRV-001)
 */
const rolesHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // If not full, go harvest
        if (creep.store.getFreeCapacity() > 0) {
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
            return;
        }

        // If full, try to transfer based on priority
        const target =
            creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }) ||
            creep.pos.findClosestByPath(FIND_MY_SPAWNS, {
                filter: spawn =>
                    spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }) ||
            creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType === STRUCTURE_EXTENSION &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
            // Fallback to Hauler logic
            // roleHauler.run(creep);
        }
    }
};

module.exports = rolesHarvester;
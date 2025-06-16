const SpawnManager = require('managers.spawn');

// Role Modules
const roleHarvester = require('roles.harvester');
const roleBuilder   = require('roles.builder');
const roleRepairer  = require('roles.repairer');
const roleUpgrader  = require('roles.upgrader');
const roleHauler    = require('roles.hauler');

const NamingUtil = require('utils.naming');
const buildStarterBase = require('utils.buildStarterBase');

const createSmartSourceRoads = require('utils.building.createSmartSourceRoads');


module.exports.loop = function () {
    // Clean up dead creeps from memory
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];

        // Calculate available spots around sources
        const sources = room.find(FIND_SOURCES);
        let totalSpots = 0;

        for (const source of sources) {
            const terrain = Game.map.getRoomTerrain(room.name);
            const { x, y } = source.pos;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const tile = terrain.get(x + dx, y + dy);
                    if (tile !== TERRAIN_MASK_WALL) {
                        totalSpots++;
                    }
                }
            }
        }

        // Calculate role targets based on ratio: 2 HRV : 1 UPG : 1 BLD : 1 REP
        const unit = Math.floor(totalSpots / 5);
        const remainder = totalSpots % 5;

        const TARGET_COUNTS = {
            HRV: unit * 2 + remainder,  // Give remainder to Harvesters
            UPG: unit,
            BLD: unit,
            REP: unit
        };

        const ROLES_PRIORITY = ['HRV', 'UPG', 'BLD', 'REP'];

        const roomCreeps = _.filter(Game.creeps, c => c.memory.targetRoom === room.name);

        for (const role of ROLES_PRIORITY) {
            const queue = Memory.spawnQueue || [];

            const queued = _.filter(queue, q =>
                q.role === role &&
                q.targetRoom === room.name
            ).length;

            const count = _.filter(roomCreeps, c =>
                c.memory.role === role
            ).length + queued;

            const target = TARGET_COUNTS[role];

            if (count < target) {
                // Build the designation name (e.g., AUXIL-HRV-003)
                const designation = NamingUtil.generateAuxDesignation(role);

                SpawnManager.request({
                    role,
                    designation,
                    requester: room.name,
                    requesterId: room.controller ? room.controller.id : null,
                    targetRoom: room.name,
                    targetId: room.controller ? room.controller.id : null,
                });

                break; // stop requesting after the first unmet role
            }
        }

        createSmartSourceRoads(room);
        buildStarterBase(room);
    }

    // Process the spawn queue
    SpawnManager.processQueue();

    // Execute creep role logic
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        switch (creep.memory.role) {
            case 'HRV': roleHarvester.run(creep); break;
            case 'BLD': roleBuilder.run(creep); break;
            case 'REP': roleRepairer.run(creep); break;
            case 'UPG': roleUpgrader.run(creep); break;
            case 'HLR': roleHauler.run(creep); break;
            // future roles go here
        }
    }
};

const NamingUtil = {
    generateAuxDesignation: function(roleCode) {
        const prefix = `AUXIL-${roleCode}-`;

        const usedNames = new Set();

        for (const name in Game.creeps) {
            if (name.startsWith(prefix)) {
                usedNames.add(name);
            }
        }

        const queue = Memory.spawnQueue || [];
        for (const order of queue) {
            if (order.designation && order.designation.startsWith(prefix)) {
                usedNames.add(order.designation);
            }
        }

        for (let i = 1; i < 1000; i++) {
            const candidate = `${prefix}${String(i).padStart(3, '0')}`;
            if (!usedNames.has(candidate)) {
                return candidate;
            }
        }

        return `${prefix}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
};

module.exports = NamingUtil;

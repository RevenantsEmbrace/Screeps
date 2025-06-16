===============================
ROLE CODE DICTIONARY
===============================

--- AUXILIARY ROLES (Support Units) ---

Format: AUXIL-ROL-XXX
- `AUXIL`: Auxiliary Group ID (00–99, e.g. by region or spawn)
- `ROL`: Role Code (3 letters)
- `XXX`: Incrementing unit ID (001–999)

| Code | Role Name        | Description                              | Fallback Chain  |
|------|------------------|------------------------------------------|-----------------|
| HRV  | Harvester        | Gathers energy from sources              | UPG → HLR       |
| RHV  | Remote Harvester | Harvests source in a non-controlled Room | None            |
| UPG  | Upgrader         | Upgrades the room controller             | HLR             |
| BLD  | Builder          | Builds structures                        | REP → UPG → HLR |
| REP  | Repairer         | Repairs damaged structures               | UPG → HLR       |
| HLR  | Hauler           | Transports energy/resources              | None            |
| SCT  | Scout            | Explores unknown territory               | None            |

--- MILITARY ROLES (Combat Units) ---

Format: LEG##-ROL-SSP
- `LEG##`: Legion number (00–99, 00 is fallback legion)
- `ROL`: Role Code (3 letters)
- `SS`: Squad number (00–99)
- `P`: Position in squad (1–9)

| Code | Role Name   | Description                                          | Position(s) | Fallback |
|------|-------------|------------------------------------------------------|-------------|----------|
| LGT  | Legate      | Legion Commander / Officer (of Squad 00 of a legion) | 1           | None     |
| CTR  | Centurion   | Squad Leader                                         | 1           | None     |
| MED  | Medic       | Healer / Support                                     | 2           | None     |
| LGR  | Legionnaire | Frontline Melee Combat Unit                          | 3-6         | None     |
| ARC  | Archer      | Ranged Combat Unit                                   | 7–9         | None     |

Notes:
- AUX units follow format: `AUXIL-ROL-XXX` (e.g. `AUX01-HRV-007`)
- LEG units follow format: `LEG##-ROL-SSP` (e.g. `LEG02-LGR-153`)
  - `LEG##`: Legion ID
  - `SS`: Squad number within the legion
  - `P`: Position in the squad

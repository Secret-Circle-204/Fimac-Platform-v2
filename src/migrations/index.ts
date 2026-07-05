import * as migration_20260609_100132_init from './20260609_100132_init';
import * as migration_20260609_114128_add_currency_fields from './20260609_114128_add_currency_fields';
import * as migration_20260704_165904 from './20260704_165904';
import * as migration_20260704_191146 from './20260704_191146';
import * as migration_20260705_082010 from './20260705_082010';

export const migrations = [
  {
    up: migration_20260609_100132_init.up,
    down: migration_20260609_100132_init.down,
    name: '20260609_100132_init',
  },
  {
    up: migration_20260609_114128_add_currency_fields.up,
    down: migration_20260609_114128_add_currency_fields.down,
    name: '20260609_114128_add_currency_fields',
  },
  {
    up: migration_20260704_165904.up,
    down: migration_20260704_165904.down,
    name: '20260704_165904',
  },
  {
    up: migration_20260704_191146.up,
    down: migration_20260704_191146.down,
    name: '20260704_191146',
  },
  {
    up: migration_20260705_082010.up,
    down: migration_20260705_082010.down,
    name: '20260705_082010'
  },
];

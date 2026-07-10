import * as migration_20260609_100132_init from './20260609_100132_init';
import * as migration_20260609_114128_add_currency_fields from './20260609_114128_add_currency_fields';
import * as migration_20260704_165904 from './20260704_165904';
import * as migration_20260704_191146 from './20260704_191146';
import * as migration_20260705_082010 from './20260705_082010';
import * as migration_20260705_173608 from './20260705_173608';
import * as migration_20260706_194503_rename_investors_to_buyers from './20260706_194503_rename_investors_to_buyers';
import * as migration_20260706_205306 from './20260706_205306';
import * as migration_20260706_205828 from './20260706_205828';
import * as migration_20260706_214602 from './20260706_214602';
import * as migration_20260707_141849 from './20260707_141849';

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
    name: '20260705_082010',
  },
  {
    up: migration_20260705_173608.up,
    down: migration_20260705_173608.down,
    name: '20260705_173608',
  },
  {
    up: migration_20260706_194503_rename_investors_to_buyers.up,
    down: migration_20260706_194503_rename_investors_to_buyers.down,
    name: '20260706_194503_rename_investors_to_buyers',
  },
  {
    up: migration_20260706_205306.up,
    down: migration_20260706_205306.down,
    name: '20260706_205306',
  },
  {
    up: migration_20260706_205828.up,
    down: migration_20260706_205828.down,
    name: '20260706_205828',
  },
  {
    up: migration_20260706_214602.up,
    down: migration_20260706_214602.down,
    name: '20260706_214602',
  },
  {
    up: migration_20260707_141849.up,
    down: migration_20260707_141849.down,
    name: '20260707_141849'
  },
];

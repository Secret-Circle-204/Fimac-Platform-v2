import * as migration_20260716_113509 from './20260716_113509';
import * as migration_20260716_130657 from './20260716_130657';
import * as migration_20260716_132403_add_zip_and_full_address from './20260716_132403_add_zip_and_full_address';

export const migrations = [
  {
    up: migration_20260716_113509.up,
    down: migration_20260716_113509.down,
    name: '20260716_113509',
  },
  {
    up: migration_20260716_130657.up,
    down: migration_20260716_130657.down,
    name: '20260716_130657',
  },
  {
    up: migration_20260716_132403_add_zip_and_full_address.up,
    down: migration_20260716_132403_add_zip_and_full_address.down,
    name: '20260716_132403_add_zip_and_full_address'
  },
];

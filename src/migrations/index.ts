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
import * as migration_20260710_184601_add_search_indexes from './20260710_184601_add_search_indexes';
import * as migration_20260710_200000_perf_hardening from './20260710_200000_perf_hardening';
import * as migration_20260710_201500_pg_trgm_indexes from './20260710_201500_pg_trgm_indexes';
import * as migration_20260710_210203_rename_notforsale_to_draft from './20260710_210203_rename_notforsale_to_draft';
import * as migration_20260711_175124_add_bedrooms_bathrooms_indexes from './20260711_175124_add_bedrooms_bathrooms_indexes';
import * as migration_20260711_185152_add_rich_fields_to_seller_requests from './20260711_185152_add_rich_fields_to_seller_requests';
import * as migration_20260711_185553_add_coords_to_seller_requests from './20260711_185553_add_coords_to_seller_requests';
import * as migration_20260711_190548_add_google_maps_url_to_seller_requests from './20260711_190548_add_google_maps_url_to_seller_requests';
import * as migration_20260712_104407 from './20260712_104407';
import * as migration_20260712_113542 from './20260712_113542';
import * as migration_20260712_133752 from './20260712_133752';
import * as migration_20260712_142843_dynamic_construction_statuses from './20260712_142843_dynamic_construction_statuses';
import * as migration_20260712_154412 from './20260712_154412';
import * as migration_20260712_154639 from './20260712_154639';
import * as migration_20260712_160940 from './20260712_160940';
import * as migration_20260712_171144 from './20260712_171144';
import * as migration_20260712_171834 from './20260712_171834';
import * as migration_20260712_205132_dynamic_property_categories from './20260712_205132_dynamic_property_categories';
import * as migration_20260712_211155 from './20260712_211155';
import * as migration_20260712_221827 from './20260712_221827';
import * as migration_20260712_223000 from './20260712_223000';

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
    name: '20260707_141849',
  },
  {
    up: migration_20260710_184601_add_search_indexes.up,
    down: migration_20260710_184601_add_search_indexes.down,
    name: '20260710_184601_add_search_indexes',
  },
  {
    up: migration_20260710_200000_perf_hardening.up,
    down: migration_20260710_200000_perf_hardening.down,
    name: '20260710_200000_perf_hardening',
  },
  {
    up: migration_20260710_201500_pg_trgm_indexes.up,
    down: migration_20260710_201500_pg_trgm_indexes.down,
    name: '20260710_201500_pg_trgm_indexes',
  },
  {
    up: migration_20260710_210203_rename_notforsale_to_draft.up,
    down: migration_20260710_210203_rename_notforsale_to_draft.down,
    name: '20260710_210203_rename_notforsale_to_draft',
  },
  {
    up: migration_20260711_175124_add_bedrooms_bathrooms_indexes.up,
    down: migration_20260711_175124_add_bedrooms_bathrooms_indexes.down,
    name: '20260711_175124_add_bedrooms_bathrooms_indexes',
  },
  {
    up: migration_20260711_185152_add_rich_fields_to_seller_requests.up,
    down: migration_20260711_185152_add_rich_fields_to_seller_requests.down,
    name: '20260711_185152_add_rich_fields_to_seller_requests',
  },
  {
    up: migration_20260711_185553_add_coords_to_seller_requests.up,
    down: migration_20260711_185553_add_coords_to_seller_requests.down,
    name: '20260711_185553_add_coords_to_seller_requests',
  },
  {
    up: migration_20260711_190548_add_google_maps_url_to_seller_requests.up,
    down: migration_20260711_190548_add_google_maps_url_to_seller_requests.down,
    name: '20260711_190548_add_google_maps_url_to_seller_requests',
  },
  {
    up: migration_20260712_104407.up,
    down: migration_20260712_104407.down,
    name: '20260712_104407',
  },
  {
    up: migration_20260712_113542.up,
    down: migration_20260712_113542.down,
    name: '20260712_113542',
  },
  {
    up: migration_20260712_133752.up,
    down: migration_20260712_133752.down,
    name: '20260712_133752',
  },
  {
    up: migration_20260712_142843_dynamic_construction_statuses.up,
    down: migration_20260712_142843_dynamic_construction_statuses.down,
    name: '20260712_142843_dynamic_construction_statuses',
  },
  {
    up: migration_20260712_154412.up,
    down: migration_20260712_154412.down,
    name: '20260712_154412',
  },
  {
    up: migration_20260712_154639.up,
    down: migration_20260712_154639.down,
    name: '20260712_154639',
  },
  {
    up: migration_20260712_160940.up,
    down: migration_20260712_160940.down,
    name: '20260712_160940',
  },
  {
    up: migration_20260712_171144.up,
    down: migration_20260712_171144.down,
    name: '20260712_171144',
  },
  {
    up: migration_20260712_171834.up,
    down: migration_20260712_171834.down,
    name: '20260712_171834',
  },
  {
    up: migration_20260712_205132_dynamic_property_categories.up,
    down: migration_20260712_205132_dynamic_property_categories.down,
    name: '20260712_205132_dynamic_property_categories',
  },
  {
    up: migration_20260712_211155.up,
    down: migration_20260712_211155.down,
    name: '20260712_211155',
  },
  {
    up: migration_20260712_221827.up,
    down: migration_20260712_221827.down,
    name: '20260712_221827',
  },
  {
    up: migration_20260712_223000.up,
    down: migration_20260712_223000.down,
    name: '20260712_223000'
  },
];

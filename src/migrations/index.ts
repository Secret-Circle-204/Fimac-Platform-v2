import * as migration_20260825_142849_add_seller_request_photos from './20260825_142849_add_seller_request_photos'

export const migrations = [
  {
    up: migration_20260825_142849_add_seller_request_photos.up,
    down: migration_20260825_142849_add_seller_request_photos.down,
    name: '20260825_142849_add_seller_request_photos',
  },
]

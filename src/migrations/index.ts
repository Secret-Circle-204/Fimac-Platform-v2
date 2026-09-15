import * as migration_20260825_142849_add_seller_request_photos from './20260825_142849_add_seller_request_photos'
import * as migration_20260915_221500_add_company_social_media from './20260915_221500_add_company_social_media'

export const migrations = [
  {
    up: migration_20260825_142849_add_seller_request_photos.up,
    down: migration_20260825_142849_add_seller_request_photos.down,
    name: '20260825_142849_add_seller_request_photos',
  },
  {
    up: migration_20260915_221500_add_company_social_media.up,
    down: migration_20260915_221500_add_company_social_media.down,
    name: '20260915_221500_add_company_social_media',
  },
]


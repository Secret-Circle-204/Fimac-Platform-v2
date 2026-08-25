import * as migration_20260717_195009_add_notification_email from './20260717_195009_add_notification_email';
import * as migration_20260717_201711_add_user_role from './20260717_201711_add_user_role';
import * as migration_20260825_142849_add_seller_request_photos from './20260825_142849_add_seller_request_photos';

export const migrations = [
  {
    up: migration_20260717_195009_add_notification_email.up,
    down: migration_20260717_195009_add_notification_email.down,
    name: '20260717_195009_add_notification_email',
  },
  {
    up: migration_20260717_201711_add_user_role.up,
    down: migration_20260717_201711_add_user_role.down,
    name: '20260717_201711_add_user_role',
  },
  {
    up: migration_20260825_142849_add_seller_request_photos.up,
    down: migration_20260825_142849_add_seller_request_photos.down,
    name: '20260825_142849_add_seller_request_photos'
  },
];

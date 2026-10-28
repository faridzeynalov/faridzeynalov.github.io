import * as migration_20261028_102320_initial from './20261028_102320_initial';
import * as migration_20261028_104202_remove_kofe_link from './20261028_104202_remove_kofe_link';
import * as migration_20261028_111540_services_and_projects from './20261028_111540_services_and_projects';
import * as migration_20261028_114842_content_collections from './20261028_114842_content_collections';
import * as migration_20261028_120325_drop_services_page from './20261028_120325_drop_services_page';
import * as migration_20261028_132615_user_avatar from './20261028_132615_user_avatar';
import * as migration_20261028_145841_media_and_settings_files from './20261028_145841_media_and_settings_files';
import * as migration_20261028_160300_three_language_fields from './20261028_160300_three_language_fields';
import * as migration_20261028_165258_client_portal from './20261028_165258_client_portal';

export const migrations = [
  {
    up: migration_20261028_102320_initial.up,
    down: migration_20261028_102320_initial.down,
    name: '20261028_102320_initial',
  },
  {
    up: migration_20261028_104202_remove_kofe_link.up,
    down: migration_20261028_104202_remove_kofe_link.down,
    name: '20261028_104202_remove_kofe_link',
  },
  {
    up: migration_20261028_111540_services_and_projects.up,
    down: migration_20261028_111540_services_and_projects.down,
    name: '20261028_111540_services_and_projects',
  },
  {
    up: migration_20261028_114842_content_collections.up,
    down: migration_20261028_114842_content_collections.down,
    name: '20261028_114842_content_collections',
  },
  {
    up: migration_20261028_120325_drop_services_page.up,
    down: migration_20261028_120325_drop_services_page.down,
    name: '20261028_120325_drop_services_page',
  },
  {
    up: migration_20261028_132615_user_avatar.up,
    down: migration_20261028_132615_user_avatar.down,
    name: '20261028_132615_user_avatar',
  },
  {
    up: migration_20261028_145841_media_and_settings_files.up,
    down: migration_20261028_145841_media_and_settings_files.down,
    name: '20261028_145841_media_and_settings_files',
  },
  {
    up: migration_20261028_160300_three_language_fields.up,
    down: migration_20261028_160300_three_language_fields.down,
    name: '20261028_160300_three_language_fields',
  },
  {
    up: migration_20261028_165258_client_portal.up,
    down: migration_20261028_165258_client_portal.down,
    name: '20261028_165258_client_portal'
  },
];

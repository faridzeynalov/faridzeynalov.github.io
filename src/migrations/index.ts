import * as migration_20261028_102320_initial from './20261028_102320_initial';
import * as migration_20261028_104202_remove_kofe_link from './20261028_104202_remove_kofe_link';

export const migrations = [
  {
    up: migration_20261028_102320_initial.up,
    down: migration_20261028_102320_initial.down,
    name: '20261028_102320_initial',
  },
  {
    up: migration_20261028_104202_remove_kofe_link.up,
    down: migration_20261028_104202_remove_kofe_link.down,
    name: '20261028_104202_remove_kofe_link'
  },
];

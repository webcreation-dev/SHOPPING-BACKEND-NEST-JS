import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv.config());

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  entities: [
    'dist/src/features/auth/users/entities/role.entity.js',
    'dist/src/features/auth/users/entities/user.entity.js',
    'dist/src/features/properties/entities/gallery.entity.js',
    'dist/src/features/properties/entities/property.entity.js',
    'dist/src/features/visits/entities/visit.entity.js',
    'dist/src/features/waitlists/entities/waitlist.entity.js',
    'dist/src/features/notifications/entities/notification.entity.js',
    'dist/src/features/properties/entities/panorama.entity.js',

    'dist/src/features/contracts/entities/contract.entity.js',
    'dist/src/features/contracts/entities/due.entity.js',
    'dist/src/features/contracts/entities/annuity.entity.js',
  ],
  migrations: ['dist/libs/common/src/database/migrations/*.js'],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

dataSource.initialize();

export default dataSource;

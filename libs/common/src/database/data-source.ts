import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv.config());

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATASOURCE_URL,
  entities: [
    'dist/src/features/auth/users/entities/user.entity.js',
    'dist/src/features/auth/users/entities/role.entity.js',
  ], // Assure-toi que les entités sont correctement importées
  migrations: ['dist/libs/common/src/database/migrations/*.js'],
});

dataSource.initialize();

export default dataSource;

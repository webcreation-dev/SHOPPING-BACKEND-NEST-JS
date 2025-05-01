import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', () => {
  const config = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    ssl: false,
    // extra: {
    //   ssl: {
    //     rejectUnauthorized: false,
    //   },
    // },
  } as const satisfies TypeOrmModuleOptions;
  return config;
});

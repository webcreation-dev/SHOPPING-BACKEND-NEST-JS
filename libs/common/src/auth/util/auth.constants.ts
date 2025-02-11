import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const THROTTLER_MODULE_OPTIONS: ThrottlerModuleOptions = [
  {
    ttl: 60,
    limit: 10,
  },
];

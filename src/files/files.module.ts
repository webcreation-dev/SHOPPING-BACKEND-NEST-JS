import { Module } from '@nestjs/common';
import { StorageService } from './storage/storage.service';
import { FseService } from './storage/fse.service';

@Module({
  providers: [
    {
      provide: StorageService,
      useClass: FseService,
    },
  ],
})
export class FilesModule {}

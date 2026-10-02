import { Global, Module } from '@nestjs/common';
import { AppConfig } from '../config/app-config';
import { LocalStorageDriver } from './local.driver';
import { S3StorageDriver } from './s3.driver';
import { StorageService } from './storage.service';
import { STORAGE_DRIVER, type StorageDriver } from './storage.types';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_DRIVER,
      inject: [AppConfig],
      useFactory: (config: AppConfig): StorageDriver => {
        const { env } = config;
        if (env.STORAGE_DRIVER === 's3') {
          const credentials =
            env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
              ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
              : undefined;
          return new S3StorageDriver(env.AWS_S3_BUCKET!, env.AWS_REGION!, config.storagePublicBaseUrl, credentials);
        }
        return new LocalStorageDriver(env.UPLOAD_DIR, config.storagePublicBaseUrl);
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}

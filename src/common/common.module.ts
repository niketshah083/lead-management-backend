import { Global, Module } from '@nestjs/common';
import { S3Service, WhatsAppService } from './services';

@Global()
@Module({
  providers: [S3Service, WhatsAppService],
  exports: [S3Service, WhatsAppService],
})
export class CommonModule {}

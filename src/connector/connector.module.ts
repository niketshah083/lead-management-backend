import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectorController } from './connector.controller';
import { ConnectorService } from './connector.service';
import {
  Connector,
  ConnectorLog,
  WebhookPayload,
  Lead,
  User,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Connector,
      ConnectorLog,
      WebhookPayload,
      Lead,
      User,
    ]),
  ],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}

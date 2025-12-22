import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig, jwtConfig, awsConfig, whatsappConfig } from './config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { MessageModule } from './message/message.module';
import { LeadModule } from './lead/lead.module';
import { LeadStatusModule } from './lead-status/lead-status.module';
import { AutoReplyModule } from './auto-reply/auto-reply.module';
import { SlaModule } from './sla/sla.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { ConnectorModule } from './connector/connector.module';
import { BusinessTypeModule } from './business-type/business-type.module';
import { JwtAuthGuard } from './auth/guards';
import { TransformInterceptor, LogInterceptor } from './common/interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, awsConfig, whatsappConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Disabled due to existing data issues
        logging: process.env.NODE_ENV === 'development' ? true : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    CommonModule,
    MessageModule,
    LeadModule,
    LeadStatusModule,
    AutoReplyModule,
    SlaModule,
    NotificationModule,
    ReportModule,
    ConnectorModule,
    BusinessTypeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

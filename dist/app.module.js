"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_2 = require("./config");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const category_module_1 = require("./category/category.module");
const common_module_1 = require("./common/common.module");
const message_module_1 = require("./message/message.module");
const lead_module_1 = require("./lead/lead.module");
const lead_status_module_1 = require("./lead-status/lead-status.module");
const auto_reply_module_1 = require("./auto-reply/auto-reply.module");
const sla_module_1 = require("./sla/sla.module");
const notification_module_1 = require("./notification/notification.module");
const report_module_1 = require("./report/report.module");
const connector_module_1 = require("./connector/connector.module");
const business_type_module_1 = require("./business-type/business-type.module");
const guards_1 = require("./auth/guards");
const interceptors_1 = require("./common/interceptors");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.databaseConfig, config_2.jwtConfig, config_2.awsConfig, config_2.whatsappConfig],
                envFilePath: ['.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                    logging: process.env.NODE_ENV === 'development' ? true : false,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            category_module_1.CategoryModule,
            common_module_1.CommonModule,
            message_module_1.MessageModule,
            lead_module_1.LeadModule,
            lead_status_module_1.LeadStatusModule,
            auto_reply_module_1.AutoReplyModule,
            sla_module_1.SlaModule,
            notification_module_1.NotificationModule,
            report_module_1.ReportModule,
            connector_module_1.ConnectorModule,
            business_type_module_1.BusinessTypeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: guards_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: interceptors_1.LogInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: interceptors_1.TransformInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
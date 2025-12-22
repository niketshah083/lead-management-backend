"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("../entities");
const services_1 = require("./services");
const message_controller_1 = require("./message.controller");
const gateways_1 = require("./gateways");
const auto_reply_module_1 = require("../auto-reply/auto-reply.module");
const sla_module_1 = require("../sla/sla.module");
const common_module_1 = require("../common/common.module");
let MessageModule = class MessageModule {
};
exports.MessageModule = MessageModule;
exports.MessageModule = MessageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([entities_1.Message, entities_1.Lead, entities_1.Category, entities_1.User, entities_1.UserCategory]),
            (0, common_1.forwardRef)(() => auto_reply_module_1.AutoReplyModule),
            (0, common_1.forwardRef)(() => sla_module_1.SlaModule),
            common_module_1.CommonModule,
        ],
        controllers: [message_controller_1.MessageController],
        providers: [
            services_1.SqsConsumerService,
            services_1.CategoryDetectorService,
            services_1.MessageService,
            gateways_1.ChatGateway,
        ],
        exports: [
            services_1.SqsConsumerService,
            services_1.CategoryDetectorService,
            services_1.MessageService,
            gateways_1.ChatGateway,
        ],
    })
], MessageModule);
//# sourceMappingURL=message.module.js.map
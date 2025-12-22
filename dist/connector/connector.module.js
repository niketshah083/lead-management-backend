"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const connector_controller_1 = require("./connector.controller");
const connector_service_1 = require("./connector.service");
const entities_1 = require("../entities");
let ConnectorModule = class ConnectorModule {
};
exports.ConnectorModule = ConnectorModule;
exports.ConnectorModule = ConnectorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Connector,
                entities_1.ConnectorLog,
                entities_1.WebhookPayload,
                entities_1.Lead,
                entities_1.User,
            ]),
        ],
        controllers: [connector_controller_1.ConnectorController],
        providers: [connector_service_1.ConnectorService],
        exports: [connector_service_1.ConnectorService],
    })
], ConnectorModule);
//# sourceMappingURL=connector.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const lead_controller_1 = require("./lead.controller");
const lead_service_1 = require("./lead.service");
const services_1 = require("./services");
let LeadModule = class LeadModule {
};
exports.LeadModule = LeadModule;
exports.LeadModule = LeadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Lead,
                entities_1.LeadHistory,
                entities_1.LeadContact,
                entities_1.Message,
                entities_1.User,
                entities_1.LeadCustomField,
                entities_1.BusinessType,
                entities_1.FieldDefinition,
            ]),
        ],
        controllers: [lead_controller_1.LeadController],
        providers: [lead_service_1.LeadService, services_1.LeadVisibilityService],
        exports: [lead_service_1.LeadService, services_1.LeadVisibilityService],
    })
], LeadModule);
//# sourceMappingURL=lead.module.js.map
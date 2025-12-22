"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTypeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const business_type_controller_1 = require("./business-type.controller");
const business_type_service_1 = require("./business-type.service");
let BusinessTypeModule = class BusinessTypeModule {
};
exports.BusinessTypeModule = BusinessTypeModule;
exports.BusinessTypeModule = BusinessTypeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.BusinessType, entities_1.FieldDefinition, entities_1.LeadCustomField]),
        ],
        controllers: [business_type_controller_1.BusinessTypeController],
        providers: [business_type_service_1.BusinessTypeService],
        exports: [business_type_service_1.BusinessTypeService],
    })
], BusinessTypeModule);
//# sourceMappingURL=business-type.module.js.map
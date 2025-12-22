"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const sla_controller_1 = require("./sla.controller");
const sla_service_1 = require("./sla.service");
const sla_scheduler_service_1 = require("./sla-scheduler.service");
const notification_module_1 = require("../notification/notification.module");
let SlaModule = class SlaModule {
};
exports.SlaModule = SlaModule;
exports.SlaModule = SlaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.SlaPolicy, entities_1.SlaTracking, entities_1.Lead]),
            (0, common_1.forwardRef)(() => notification_module_1.NotificationModule),
        ],
        controllers: [sla_controller_1.SlaController],
        providers: [sla_service_1.SlaService, sla_scheduler_service_1.SlaSchedulerService],
        exports: [sla_service_1.SlaService, sla_scheduler_service_1.SlaSchedulerService],
    })
], SlaModule);
//# sourceMappingURL=sla.module.js.map
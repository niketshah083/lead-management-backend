"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_dto_1 = require("../common/dto/user.dto");
const user_entity_1 = require("../entities/user.entity");
const decorators_1 = require("../auth/decorators");
const guards_1 = require("../auth/guards");
const enums_1 = require("../common/enums");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    async findAll(currentUser) {
        return this.userService.findAll(currentUser);
    }
    async findOne(id, currentUser) {
        return this.userService.findOne(id, currentUser);
    }
    async update(id, updateUserDto, currentUser) {
        return this.userService.update(id, updateUserDto, currentUser);
    }
    async deactivate(id, currentUser) {
        return this.userService.deactivate(id, currentUser);
    }
    async assignManager(ceId, managerId) {
        return this.userService.assignManager(ceId, managerId);
    }
    async unassignManager(ceId) {
        return this.userService.unassignManager(ceId);
    }
    async getTeamMembers(managerId, currentUser) {
        if (currentUser.role === enums_1.UserRole.MANAGER && currentUser.id !== managerId) {
            return [];
        }
        return this.userService.getTeamMembers(managerId);
    }
    async assignCategories(userId, assignCategoriesDto) {
        return this.userService.assignCategories(userId, assignCategoriesDto);
    }
    async addCategory(userId, categoryId) {
        return this.userService.addCategory(userId, categoryId);
    }
    async removeCategory(userId, categoryId) {
        return this.userService.removeCategory(userId, categoryId);
    }
    async getUserCategories(userId) {
        return this.userService.getUserCategories(userId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':ceId/assign-manager/:managerId'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('ceId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('managerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignManager", null);
__decorate([
    (0, common_1.Delete)(':ceId/unassign-manager'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('ceId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unassignManager", null);
__decorate([
    (0, common_1.Get)('manager/:managerId/team'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('managerId', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getTeamMembers", null);
__decorate([
    (0, common_1.Put)(':userId/categories'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.AssignCategoriesDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignCategories", null);
__decorate([
    (0, common_1.Post)(':userId/categories/:categoryId'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('categoryId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addCategory", null);
__decorate([
    (0, common_1.Delete)(':userId/categories/:categoryId'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('categoryId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Get)(':userId/categories'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserCategories", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map
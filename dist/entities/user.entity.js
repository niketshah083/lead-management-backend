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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const category_entity_1 = require("./category.entity");
let User = class User {
    id;
    email;
    passwordHash;
    name;
    phone;
    role;
    managerId;
    manager;
    subordinates;
    categories;
    fcmToken;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.UserRole }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.subordinates),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", User)
], User.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User, (user) => user.manager),
    __metadata("design:type", Array)
], User.prototype, "subordinates", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.Category),
    (0, typeorm_1.JoinTable)({
        name: 'user_categories',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], User.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_token', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "fcmToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map
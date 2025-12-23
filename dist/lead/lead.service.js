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
var LeadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const csv = require("csv-parser");
const stream_1 = require("stream");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
let LeadService = LeadService_1 = class LeadService {
    leadRepository;
    leadHistoryRepository;
    leadContactRepository;
    messageRepository;
    userRepository;
    leadCustomFieldRepository;
    businessTypeRepository;
    fieldDefinitionRepository;
    logger = new common_1.Logger(LeadService_1.name);
    constructor(leadRepository, leadHistoryRepository, leadContactRepository, messageRepository, userRepository, leadCustomFieldRepository, businessTypeRepository, fieldDefinitionRepository) {
        this.leadRepository = leadRepository;
        this.leadHistoryRepository = leadHistoryRepository;
        this.leadContactRepository = leadContactRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.leadCustomFieldRepository = leadCustomFieldRepository;
        this.businessTypeRepository = businessTypeRepository;
        this.fieldDefinitionRepository = fieldDefinitionRepository;
    }
    async create(dto) {
        const { LeadStatusMaster } = await Promise.resolve().then(() => require('../entities'));
        const statusMasterRepo = this.leadRepository.manager.getRepository(LeadStatusMaster);
        let initialStatus = await statusMasterRepo.findOne({
            where: { isInitial: true, isActive: true },
        });
        if (!initialStatus) {
            initialStatus = await statusMasterRepo.findOne({
                where: { name: 'New', isActive: true },
            });
        }
        const statusName = dto.status || initialStatus?.name || 'new';
        const lead = this.leadRepository.create({
            phoneNumber: dto.phoneNumber,
            name: dto.name,
            categoryId: dto.categoryId || undefined,
            businessTypeId: dto.businessTypeId || undefined,
            status: statusName,
            statusMasterId: initialStatus?.id,
        });
        const savedLead = await this.leadRepository.save(lead);
        this.logger.log(`Created lead ${savedLead.id} for phone ${dto.phoneNumber}`);
        return savedLead;
    }
    async findAll(filters, currentUser) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
            .leftJoinAndSelect('lead.statusMaster', 'statusMaster')
            .where('lead.deletedAt IS NULL');
        await this.applyRoleBasedFilter(query, currentUser);
        if (filters.status && filters.status.length > 0) {
            query.andWhere('lead.status IN (:...statuses)', {
                statuses: filters.status,
            });
        }
        if (filters.categoryId) {
            query.andWhere('lead.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        if (filters.unassignedOnly) {
            query.andWhere('lead.assignedToId IS NULL');
        }
        else if (filters.assignedToId) {
            query.andWhere('lead.assignedToId = :assignedToId', {
                assignedToId: filters.assignedToId,
            });
        }
        if (filters.dateFrom) {
            query.andWhere('lead.createdAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters.dateTo) {
            query.andWhere('lead.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.search) {
            const searchTerm = `%${filters.search.toLowerCase()}%`;
            query.andWhere('(LOWER(lead.name) LIKE :search OR LOWER(lead.phoneNumber) LIKE :search OR LOWER(lead.email) LIKE :search OR LOWER(lead.businessName) LIKE :search)', { search: searchTerm });
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        query.orderBy('lead.createdAt', 'DESC').skip(skip).take(limit);
        const [data, total] = await query.getManyAndCount();
        return { data, total, page, limit };
    }
    async applyRoleBasedFilter(query, currentUser) {
        if (currentUser.role === enums_1.UserRole.ADMIN) {
            return;
        }
        if (currentUser.role === enums_1.UserRole.MANAGER) {
            const teamMembers = await this.userRepository.find({
                where: { managerId: currentUser.id, isActive: true },
                select: ['id'],
            });
            const teamIds = [currentUser.id, ...teamMembers.map((m) => m.id)];
            query.andWhere('(lead.assignedToId IN (:...teamIds) OR lead.assignedToId IS NULL)', { teamIds });
        }
        else {
            const user = await this.userRepository.findOne({
                where: { id: currentUser.id },
                relations: ['categories'],
            });
            const categoryIds = user?.categories?.map((c) => c.id) || [];
            if (categoryIds.length > 0) {
                query.andWhere('(lead.assignedToId = :userId OR (lead.assignedToId IS NULL AND lead.categoryId IN (:...categoryIds)))', { userId: currentUser.id, categoryIds });
            }
            else {
                query.andWhere('lead.assignedToId = :userId', {
                    userId: currentUser.id,
                });
            }
        }
    }
    async findOne(id, currentUser) {
        const lead = await this.leadRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: [
                'category',
                'assignedTo',
                'messages',
                'history',
                'slaTracking',
                'contacts',
                'statusMaster',
            ],
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        await this.checkLeadAccess(lead, currentUser);
        return lead;
    }
    async claim(id, userId) {
        const lead = await this.leadRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        if (lead.assignedToId) {
            throw new common_1.ConflictException('Lead is already claimed by another user');
        }
        lead.assignedToId = userId;
        lead.claimedAt = new Date();
        const savedLead = await this.leadRepository.save(lead);
        this.logger.log(`Lead ${id} claimed by user ${userId}`);
        return savedLead;
    }
    async update(id, dto, currentUser) {
        const lead = await this.findOne(id, currentUser);
        const changes = [];
        if (dto.categoryId !== undefined && dto.categoryId !== lead.categoryId) {
            const oldCategoryName = lead.category?.name || 'None';
            let newCategoryName = 'None';
            if (dto.categoryId) {
                const { Category } = await Promise.resolve().then(() => require('../entities'));
                const categoryRepo = this.leadRepository.manager.getRepository(Category);
                const newCategory = await categoryRepo.findOne({
                    where: { id: dto.categoryId },
                });
                newCategoryName = newCategory?.name || 'Unknown';
            }
            changes.push(`Category changed from "${oldCategoryName}" to "${newCategoryName}"`);
            lead.categoryId = dto.categoryId || null;
        }
        const previousStatus = lead.status;
        if (dto.status !== undefined && dto.status !== lead.status) {
            changes.push(`Status changed from "${previousStatus}" to "${dto.status}"`);
            lead.status = dto.status;
        }
        if (dto.name !== undefined && dto.name !== lead.name) {
            changes.push(`Name changed from "${lead.name || 'None'}" to "${dto.name}"`);
            lead.name = dto.name;
        }
        const savedLead = await this.leadRepository.save(lead);
        if (changes.length > 0) {
            await this.createHistoryRecord(lead, previousStatus, lead.status, currentUser.id, changes.join('. '));
            this.logger.log(`Lead ${id} updated: ${changes.join(', ')}`);
        }
        return this.findOne(id, currentUser);
    }
    async updateStatus(id, dto, currentUser) {
        const lead = await this.findOne(id, currentUser);
        const previousStatus = lead.status;
        const { LeadStatusMaster } = await Promise.resolve().then(() => require('../entities'));
        const statusMasterRepo = this.leadRepository.manager.getRepository(LeadStatusMaster);
        let newStatusMaster = null;
        let newStatusName;
        if (dto.statusMasterId) {
            newStatusMaster = await statusMasterRepo.findOne({
                where: { id: dto.statusMasterId, isActive: true },
            });
            if (!newStatusMaster) {
                throw new common_1.NotFoundException('Status not found or inactive');
            }
            newStatusName = newStatusMaster.name;
        }
        else if (dto.status) {
            newStatusMaster = await statusMasterRepo.findOne({
                where: { name: dto.status, isActive: true },
            });
            if (!newStatusMaster) {
                const allStatuses = await statusMasterRepo.find({
                    where: { isActive: true },
                });
                const statusToFind = dto.status;
                newStatusMaster = allStatuses.find((s) => s.name.trim().toLowerCase() === statusToFind.trim().toLowerCase());
            }
            if (!newStatusMaster) {
                throw new common_1.NotFoundException(`Status "${dto.status}" not found or inactive`);
            }
            newStatusName = newStatusMaster.name;
        }
        else {
            throw new common_1.NotFoundException('Status or statusMasterId is required');
        }
        lead.status = newStatusName;
        lead.statusMasterId = newStatusMaster.id;
        const savedLead = await this.leadRepository.save(lead);
        await this.createHistoryRecord(lead, previousStatus, newStatusName, currentUser.id, dto.notes);
        this.logger.log(`Lead ${id} status changed from ${previousStatus} to ${newStatusName}`);
        return savedLead;
    }
    async reassign(id, dto, currentUser) {
        const lead = await this.findOne(id, currentUser);
        const targetUser = await this.userRepository.findOne({
            where: { id: dto.assignedToId, isActive: true },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('Target user not found or inactive');
        }
        if (currentUser.role === enums_1.UserRole.MANAGER) {
            if (targetUser.managerId !== currentUser.id &&
                targetUser.id !== currentUser.id) {
                throw new common_1.ForbiddenException('Can only reassign to team members');
            }
        }
        const previousAssignee = lead.assignedToId;
        lead.assignedToId = dto.assignedToId;
        lead.claimedAt = new Date();
        const savedLead = await this.leadRepository.save(lead);
        await this.createHistoryRecord(lead, lead.status, lead.status, currentUser.id, `Reassigned from ${previousAssignee || 'unassigned'} to ${dto.assignedToId}. ${dto.notes || ''}`);
        this.logger.log(`Lead ${id} reassigned to ${dto.assignedToId}`);
        return savedLead;
    }
    async getHistory(id, currentUser) {
        await this.findOne(id, currentUser);
        return this.leadHistoryRepository.find({
            where: { leadId: id },
            relations: ['changedBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOrCreateByPhone(phoneNumber, categoryId) {
        let lead = await this.leadRepository.findOne({
            where: { phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!lead) {
            lead = await this.create({
                phoneNumber,
                categoryId,
            });
        }
        return lead;
    }
    async createHistoryRecord(lead, previousStatus, newStatus, changedById, notes) {
        const history = this.leadHistoryRepository.create({
            leadId: lead.id,
            previousStatus: previousStatus,
            newStatus: newStatus,
            changedById,
            notes,
        });
        return this.leadHistoryRepository.save(history);
    }
    async checkLeadAccess(lead, currentUser) {
        if (currentUser.role === enums_1.UserRole.ADMIN) {
            return;
        }
        if (currentUser.role === enums_1.UserRole.MANAGER) {
            if (lead.assignedToId) {
                const assignee = await this.userRepository.findOne({
                    where: { id: lead.assignedToId },
                });
                if (assignee?.managerId !== currentUser.id &&
                    lead.assignedToId !== currentUser.id) {
                    throw new common_1.ForbiddenException('Access denied to this lead');
                }
            }
            return;
        }
        if (lead.assignedToId && lead.assignedToId !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied to this lead');
        }
    }
    async updateAddress(leadId, dto, currentUser) {
        const lead = await this.findOne(leadId, currentUser);
        if (dto.addressLine1 !== undefined)
            lead.addressLine1 = dto.addressLine1;
        if (dto.addressLine2 !== undefined)
            lead.addressLine2 = dto.addressLine2;
        if (dto.city !== undefined)
            lead.city = dto.city;
        if (dto.state !== undefined)
            lead.state = dto.state;
        if (dto.country !== undefined)
            lead.country = dto.country;
        await this.leadRepository.save(lead);
        this.logger.log(`Lead ${leadId} address updated`);
        return this.findOne(leadId, currentUser);
    }
    async getContacts(leadId, currentUser) {
        await this.findOne(leadId, currentUser);
        return this.leadContactRepository.find({
            where: { leadId },
            order: { isPrimary: 'DESC', createdAt: 'ASC' },
        });
    }
    async createContact(leadId, dto, currentUser) {
        await this.findOne(leadId, currentUser);
        if (dto.isPrimary) {
            await this.leadContactRepository.update({ leadId, isPrimary: true }, { isPrimary: false });
        }
        const contact = this.leadContactRepository.create({
            leadId,
            name: dto.name,
            designation: dto.designation,
            phone: dto.phone,
            email: dto.email,
            isPrimary: dto.isPrimary || false,
        });
        const savedContact = await this.leadContactRepository.save(contact);
        this.logger.log(`Contact ${savedContact.id} created for lead ${leadId}`);
        return savedContact;
    }
    async updateContact(leadId, contactId, dto, currentUser) {
        await this.findOne(leadId, currentUser);
        const contact = await this.leadContactRepository.findOne({
            where: { id: contactId, leadId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID ${contactId} not found`);
        }
        if (dto.isPrimary && !contact.isPrimary) {
            await this.leadContactRepository.update({ leadId, isPrimary: true }, { isPrimary: false });
        }
        if (dto.name !== undefined)
            contact.name = dto.name;
        if (dto.designation !== undefined)
            contact.designation = dto.designation;
        if (dto.phone !== undefined)
            contact.phone = dto.phone;
        if (dto.email !== undefined)
            contact.email = dto.email;
        if (dto.isPrimary !== undefined)
            contact.isPrimary = dto.isPrimary;
        const savedContact = await this.leadContactRepository.save(contact);
        this.logger.log(`Contact ${contactId} updated`);
        return savedContact;
    }
    async deleteContact(leadId, contactId, currentUser) {
        await this.findOne(leadId, currentUser);
        const contact = await this.leadContactRepository.findOne({
            where: { id: contactId, leadId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID ${contactId} not found`);
        }
        await this.leadContactRepository.remove(contact);
        this.logger.log(`Contact ${contactId} deleted from lead ${leadId}`);
    }
    async lookupPincode(pincode) {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
                const postOffice = data[0].PostOffice[0];
                return {
                    city: postOffice.District || postOffice.Name,
                    state: postOffice.State,
                    country: 'India',
                };
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Pincode lookup failed for ${pincode}:`, error);
            return null;
        }
    }
    async bulkUpload(leads, currentUser) {
        const errors = [];
        let successful = 0;
        let failed = 0;
        const { LeadStatusMaster } = await Promise.resolve().then(() => require('../entities'));
        const statusMasterRepo = this.leadRepository.manager.getRepository(LeadStatusMaster);
        const newStatus = await statusMasterRepo.findOne({
            where: { name: 'New', isActive: true },
        });
        for (let i = 0; i < leads.length; i++) {
            try {
                const row = leads[i];
                if (!row.phoneNumber || !row.name) {
                    errors.push({
                        row: i + 2,
                        error: 'Phone number and name are required',
                    });
                    failed++;
                    continue;
                }
                const existing = await this.leadRepository.findOne({
                    where: { phoneNumber: row.phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
                });
                if (existing) {
                    errors.push({
                        row: i + 2,
                        error: `Lead with phone ${row.phoneNumber} already exists`,
                    });
                    failed++;
                    continue;
                }
                const lead = this.leadRepository.create({
                    phoneNumber: row.phoneNumber,
                    name: row.name,
                    source: row.source,
                    categoryId: row.categoryId || null,
                    status: enums_1.LeadStatus.NEW,
                    statusMasterId: newStatus?.id,
                    createdAt: row.date ? new Date(row.date) : new Date(),
                });
                await this.leadRepository.save(lead);
                successful++;
                this.logger.log(`Bulk uploaded lead: ${lead.phoneNumber}`);
            }
            catch (error) {
                errors.push({
                    row: i + 2,
                    error: error.message || 'Unknown error',
                });
                failed++;
            }
        }
        return { successful, failed, errors };
    }
    async bulkUploadFromCsv(file, currentUser) {
        const errors = [];
        let created = 0;
        let skipped = 0;
        let total = 0;
        const { LeadStatusMaster, Category } = await Promise.resolve().then(() => require('../entities'));
        const statusMasterRepo = this.leadRepository.manager.getRepository(LeadStatusMaster);
        const categoryRepo = this.leadRepository.manager.getRepository(Category);
        const newStatus = await statusMasterRepo.findOne({
            where: { name: 'New', isActive: true },
        });
        const categories = await categoryRepo.find({
            where: { isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
        });
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = stream_1.Readable.from(file.buffer.toString());
            stream
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                total = results.length;
                for (let i = 0; i < results.length; i++) {
                    try {
                        const row = results[i];
                        const rowNumber = i + 2;
                        if (!row.phoneNumber) {
                            errors.push({
                                row: rowNumber,
                                message: 'Phone number is required',
                            });
                            skipped++;
                            continue;
                        }
                        let phoneNumber = row.phoneNumber.toString().trim();
                        if (!phoneNumber.startsWith('+')) {
                            phoneNumber = '+' + phoneNumber;
                        }
                        const existing = await this.leadRepository.findOne({
                            where: { phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
                        });
                        if (existing) {
                            errors.push({
                                row: rowNumber,
                                message: `Lead with phone ${phoneNumber} already exists`,
                            });
                            skipped++;
                            continue;
                        }
                        let categoryId = null;
                        if (row.categoryName) {
                            const category = categories.find((c) => c.name.toLowerCase() === row.categoryName.toLowerCase());
                            if (category) {
                                categoryId = category.id;
                            }
                            else {
                                errors.push({
                                    row: rowNumber,
                                    message: `Category '${row.categoryName}' not found`,
                                });
                            }
                        }
                        const lead = this.leadRepository.create({
                            phoneNumber,
                            name: row.name?.trim() || `Customer ${phoneNumber.slice(-4)}`,
                            email: row.email?.trim() || null,
                            businessName: row.businessName?.trim() || null,
                            categoryId,
                            status: enums_1.LeadStatus.NEW,
                            statusMasterId: newStatus?.id,
                            createdAt: new Date(),
                        });
                        await this.leadRepository.save(lead);
                        created++;
                        this.logger.log(`CSV bulk uploaded lead: ${lead.phoneNumber}`);
                    }
                    catch (error) {
                        errors.push({
                            row: i + 2,
                            message: error.message || 'Unknown error',
                        });
                        skipped++;
                    }
                }
                resolve({ total, created, skipped, errors });
            })
                .on('error', (error) => {
                this.logger.error('CSV parsing error:', error);
                reject(error);
            });
        });
    }
    async getCustomFields(leadId, currentUser) {
        await this.findOne(leadId, currentUser);
        return this.leadCustomFieldRepository.find({
            where: { leadId },
            relations: ['fieldDefinition'],
        });
    }
    async setCustomField(leadId, fieldDefinitionId, value, arrayValue, currentUser) {
        await this.findOne(leadId, currentUser);
        const fieldDef = await this.fieldDefinitionRepository.findOne({
            where: { id: fieldDefinitionId },
        });
        if (!fieldDef) {
            throw new common_1.NotFoundException(`Field definition with ID ${fieldDefinitionId} not found`);
        }
        let customField = await this.leadCustomFieldRepository.findOne({
            where: { leadId, fieldDefinitionId },
        });
        if (customField) {
            customField.value = value || undefined;
            customField.arrayValue = arrayValue || undefined;
        }
        else {
            customField = this.leadCustomFieldRepository.create({
                leadId,
                fieldDefinitionId,
                value: value || undefined,
                arrayValue: arrayValue || undefined,
            });
        }
        const saved = await this.leadCustomFieldRepository.save(customField);
        this.logger.log(`Set custom field ${fieldDefinitionId} for lead ${leadId}`);
        return saved;
    }
    async bulkSetCustomFields(leadId, fields, currentUser) {
        await this.findOne(leadId, currentUser);
        const results = [];
        for (const field of fields) {
            const result = await this.setCustomField(leadId, field.fieldDefinitionId, field.value || null, field.arrayValue || null, currentUser);
            results.push(result);
        }
        return results;
    }
    async deleteCustomField(leadId, fieldDefinitionId, currentUser) {
        await this.findOne(leadId, currentUser);
        const customField = await this.leadCustomFieldRepository.findOne({
            where: { leadId, fieldDefinitionId },
        });
        if (customField) {
            await this.leadCustomFieldRepository.remove(customField);
            this.logger.log(`Deleted custom field ${fieldDefinitionId} for lead ${leadId}`);
        }
    }
    async updateBusinessType(leadId, businessTypeId, currentUser) {
        const lead = await this.findOne(leadId, currentUser);
        if (businessTypeId) {
            const businessType = await this.businessTypeRepository.findOne({
                where: { id: businessTypeId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!businessType) {
                throw new common_1.NotFoundException(`Business type with ID ${businessTypeId} not found`);
            }
        }
        lead.businessTypeId = businessTypeId || undefined;
        await this.leadRepository.save(lead);
        this.logger.log(`Lead ${leadId} business type updated to ${businessTypeId}`);
        return this.findOne(leadId, currentUser);
    }
    async getLeadWithCustomFields(leadId, currentUser) {
        const lead = await this.findOne(leadId, currentUser);
        const customFields = await this.getCustomFields(leadId, currentUser);
        const customFieldValues = {};
        for (const cf of customFields) {
            const fieldName = cf.fieldDefinition?.name || cf.fieldDefinitionId;
            customFieldValues[fieldName] = cf.arrayValue || cf.value;
        }
        return { ...lead, customFieldValues };
    }
};
exports.LeadService = LeadService;
exports.LeadService = LeadService = LeadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.LeadHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.LeadContact)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Message)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.LeadCustomField)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.BusinessType)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.FieldDefinition)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeadService);
//# sourceMappingURL=lead.service.js.map
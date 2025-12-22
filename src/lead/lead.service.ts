import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  IsNull,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import {
  Lead,
  LeadHistory,
  LeadContact,
  Message,
  User,
  LeadCustomField,
  BusinessType,
  FieldDefinition,
} from '../entities';
import { LeadStatus, UserRole } from '../common/enums';
import {
  CreateLeadDto,
  UpdateLeadDto,
  UpdateStatusDto,
  ReassignLeadDto,
  LeadFilterDto,
  CreateLeadContactDto,
  UpdateLeadContactDto,
  UpdateLeadAddressDto,
} from './dto';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(LeadHistory)
    private readonly leadHistoryRepository: Repository<LeadHistory>,
    @InjectRepository(LeadContact)
    private readonly leadContactRepository: Repository<LeadContact>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LeadCustomField)
    private readonly leadCustomFieldRepository: Repository<LeadCustomField>,
    @InjectRepository(BusinessType)
    private readonly businessTypeRepository: Repository<BusinessType>,
    @InjectRepository(FieldDefinition)
    private readonly fieldDefinitionRepository: Repository<FieldDefinition>,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    // Get the initial status from LeadStatusMaster
    const { LeadStatusMaster } = await import('../entities');
    const statusMasterRepo =
      this.leadRepository.manager.getRepository(LeadStatusMaster);

    // First try to find status marked as initial, fallback to "New"
    let initialStatus = await statusMasterRepo.findOne({
      where: { isInitial: true, isActive: true },
    });

    if (!initialStatus) {
      initialStatus = await statusMasterRepo.findOne({
        where: { name: 'New', isActive: true },
      });
    }

    const lead = this.leadRepository.create({
      phoneNumber: dto.phoneNumber,
      name: dto.name,
      categoryId: dto.categoryId || undefined,
      businessTypeId: dto.businessTypeId || undefined,
      status: dto.status || LeadStatus.NEW,
      statusMasterId: initialStatus?.id,
    });

    const savedLead = await this.leadRepository.save(lead);
    this.logger.log(
      `Created lead ${savedLead.id} for phone ${dto.phoneNumber}`,
    );
    return savedLead;
  }

  async findAll(
    filters: LeadFilterDto,
    currentUser: User,
  ): Promise<{ data: Lead[]; total: number; page: number; limit: number }> {
    const query = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.category', 'category')
      .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
      .leftJoinAndSelect('lead.statusMaster', 'statusMaster')
      .where('lead.deletedAt IS NULL');

    // Apply role-based filtering
    await this.applyRoleBasedFilter(query, currentUser);

    // Apply filters
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
    } else if (filters.assignedToId) {
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

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    query.orderBy('lead.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  private async applyRoleBasedFilter(
    query: any,
    currentUser: User,
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      // Admin sees all leads
      return;
    }

    if (currentUser.role === UserRole.MANAGER) {
      // Manager sees leads assigned to their team
      const teamMembers = await this.userRepository.find({
        where: { managerId: currentUser.id, isActive: true },
        select: ['id'],
      });
      const teamIds = [currentUser.id, ...teamMembers.map((m) => m.id)];
      query.andWhere(
        '(lead.assignedToId IN (:...teamIds) OR lead.assignedToId IS NULL)',
        { teamIds },
      );
    } else {
      // Customer Executive sees leads assigned to them or unassigned leads in their categories
      const user = await this.userRepository.findOne({
        where: { id: currentUser.id },
        relations: ['categories'],
      });

      const categoryIds = user?.categories?.map((c) => c.id) || [];

      if (categoryIds.length > 0) {
        query.andWhere(
          '(lead.assignedToId = :userId OR (lead.assignedToId IS NULL AND lead.categoryId IN (:...categoryIds)))',
          { userId: currentUser.id, categoryIds },
        );
      } else {
        query.andWhere('lead.assignedToId = :userId', {
          userId: currentUser.id,
        });
      }
    }
  }

  async findOne(id: string, currentUser: User): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id, deletedAt: IsNull() },
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
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Check access permission
    await this.checkLeadAccess(lead, currentUser);

    return lead;
  }

  async claim(id: string, userId: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    if (lead.assignedToId) {
      throw new ConflictException('Lead is already claimed by another user');
    }

    lead.assignedToId = userId;
    lead.claimedAt = new Date();

    const savedLead = await this.leadRepository.save(lead);
    this.logger.log(`Lead ${id} claimed by user ${userId}`);

    return savedLead;
  }

  async update(
    id: string,
    dto: UpdateLeadDto,
    currentUser: User,
  ): Promise<Lead> {
    const lead = await this.findOne(id, currentUser);
    const changes: string[] = [];

    // Track category change
    if (dto.categoryId !== undefined && dto.categoryId !== lead.categoryId) {
      const oldCategoryName = lead.category?.name || 'None';
      let newCategoryName = 'None';

      if (dto.categoryId) {
        // Fetch new category name for history
        const { Category } = await import('../entities');
        const categoryRepo =
          this.leadRepository.manager.getRepository(Category);
        const newCategory = await categoryRepo.findOne({
          where: { id: dto.categoryId },
        });
        newCategoryName = newCategory?.name || 'Unknown';
      }

      changes.push(
        `Category changed from "${oldCategoryName}" to "${newCategoryName}"`,
      );
      lead.categoryId = dto.categoryId || null;
    }

    // Track status change
    const previousStatus = lead.status;
    if (dto.status !== undefined && dto.status !== lead.status) {
      changes.push(
        `Status changed from "${previousStatus}" to "${dto.status}"`,
      );
      lead.status = dto.status;
    }

    // Track name change
    if (dto.name !== undefined && dto.name !== lead.name) {
      changes.push(
        `Name changed from "${lead.name || 'None'}" to "${dto.name}"`,
      );
      lead.name = dto.name;
    }

    const savedLead = await this.leadRepository.save(lead);

    // Create history record if there were changes
    if (changes.length > 0) {
      await this.createHistoryRecord(
        lead,
        previousStatus,
        lead.status,
        currentUser.id,
        changes.join('. '),
      );

      this.logger.log(`Lead ${id} updated: ${changes.join(', ')}`);
    }

    // Reload with relations
    return this.findOne(id, currentUser);
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    currentUser: User,
  ): Promise<Lead> {
    const lead = await this.findOne(id, currentUser);
    const previousStatus = lead.status;

    // Get the status master for the new status
    const { LeadStatusMaster } = await import('../entities');
    const statusMasterRepo =
      this.leadRepository.manager.getRepository(LeadStatusMaster);
    const newStatusMaster = await statusMasterRepo.findOne({
      where: { name: dto.status, isActive: true },
    });

    lead.status = dto.status;
    if (newStatusMaster) {
      lead.statusMasterId = newStatusMaster.id;
    }
    const savedLead = await this.leadRepository.save(lead);

    // Create history record
    await this.createHistoryRecord(
      lead,
      previousStatus,
      dto.status,
      currentUser.id,
      dto.notes,
    );

    this.logger.log(
      `Lead ${id} status changed from ${previousStatus} to ${dto.status}`,
    );

    return savedLead;
  }

  async reassign(
    id: string,
    dto: ReassignLeadDto,
    currentUser: User,
  ): Promise<Lead> {
    const lead = await this.findOne(id, currentUser);

    // Verify target user exists and is active
    const targetUser = await this.userRepository.findOne({
      where: { id: dto.assignedToId, isActive: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found or inactive');
    }

    // Check reassignment permissions
    if (currentUser.role === UserRole.MANAGER) {
      // Manager can only reassign within their team
      if (
        targetUser.managerId !== currentUser.id &&
        targetUser.id !== currentUser.id
      ) {
        throw new ForbiddenException('Can only reassign to team members');
      }
    }

    const previousAssignee = lead.assignedToId;
    lead.assignedToId = dto.assignedToId;
    lead.claimedAt = new Date();

    const savedLead = await this.leadRepository.save(lead);

    // Create history record for reassignment
    await this.createHistoryRecord(
      lead,
      lead.status,
      lead.status,
      currentUser.id,
      `Reassigned from ${previousAssignee || 'unassigned'} to ${dto.assignedToId}. ${dto.notes || ''}`,
    );

    this.logger.log(`Lead ${id} reassigned to ${dto.assignedToId}`);

    return savedLead;
  }

  async getHistory(id: string, currentUser: User): Promise<LeadHistory[]> {
    await this.findOne(id, currentUser); // Check access

    return this.leadHistoryRepository.find({
      where: { leadId: id },
      relations: ['changedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrCreateByPhone(
    phoneNumber: string,
    categoryId: string,
  ): Promise<Lead> {
    let lead = await this.leadRepository.findOne({
      where: { phoneNumber, deletedAt: IsNull() },
    });

    if (!lead) {
      lead = await this.create({
        phoneNumber,
        categoryId,
      });
    }

    return lead;
  }

  private async createHistoryRecord(
    lead: Lead,
    previousStatus: LeadStatus,
    newStatus: LeadStatus,
    changedById: string,
    notes?: string,
  ): Promise<LeadHistory> {
    const history = this.leadHistoryRepository.create({
      leadId: lead.id,
      previousStatus,
      newStatus,
      changedById,
      notes,
    });

    return this.leadHistoryRepository.save(history);
  }

  private async checkLeadAccess(lead: Lead, currentUser: User): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return; // Admin has full access
    }

    if (currentUser.role === UserRole.MANAGER) {
      // Manager can access leads of their team
      if (lead.assignedToId) {
        const assignee = await this.userRepository.findOne({
          where: { id: lead.assignedToId },
        });
        if (
          assignee?.managerId !== currentUser.id &&
          lead.assignedToId !== currentUser.id
        ) {
          throw new ForbiddenException('Access denied to this lead');
        }
      }
      return;
    }

    // Customer Executive
    if (lead.assignedToId && lead.assignedToId !== currentUser.id) {
      throw new ForbiddenException('Access denied to this lead');
    }
  }

  // ============ Address Methods ============

  async updateAddress(
    leadId: string,
    dto: UpdateLeadAddressDto,
    currentUser: User,
  ): Promise<Lead> {
    const lead = await this.findOne(leadId, currentUser);

    if (dto.addressLine1 !== undefined) lead.addressLine1 = dto.addressLine1;
    if (dto.addressLine2 !== undefined) lead.addressLine2 = dto.addressLine2;
    if (dto.city !== undefined) lead.city = dto.city;
    if (dto.state !== undefined) lead.state = dto.state;
    if (dto.country !== undefined) lead.country = dto.country;

    await this.leadRepository.save(lead);
    this.logger.log(`Lead ${leadId} address updated`);

    return this.findOne(leadId, currentUser);
  }

  // ============ Contact Methods ============

  async getContacts(leadId: string, currentUser: User): Promise<LeadContact[]> {
    await this.findOne(leadId, currentUser); // Check access

    return this.leadContactRepository.find({
      where: { leadId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async createContact(
    leadId: string,
    dto: CreateLeadContactDto,
    currentUser: User,
  ): Promise<LeadContact> {
    await this.findOne(leadId, currentUser); // Check access

    // If this is set as primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.leadContactRepository.update(
        { leadId, isPrimary: true },
        { isPrimary: false },
      );
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

  async updateContact(
    leadId: string,
    contactId: string,
    dto: UpdateLeadContactDto,
    currentUser: User,
  ): Promise<LeadContact> {
    await this.findOne(leadId, currentUser); // Check access

    const contact = await this.leadContactRepository.findOne({
      where: { id: contactId, leadId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    // If setting as primary, unset other primary contacts
    if (dto.isPrimary && !contact.isPrimary) {
      await this.leadContactRepository.update(
        { leadId, isPrimary: true },
        { isPrimary: false },
      );
    }

    if (dto.name !== undefined) contact.name = dto.name;
    if (dto.designation !== undefined) contact.designation = dto.designation;
    if (dto.phone !== undefined) contact.phone = dto.phone;
    if (dto.email !== undefined) contact.email = dto.email;
    if (dto.isPrimary !== undefined) contact.isPrimary = dto.isPrimary;

    const savedContact = await this.leadContactRepository.save(contact);
    this.logger.log(`Contact ${contactId} updated`);

    return savedContact;
  }

  async deleteContact(
    leadId: string,
    contactId: string,
    currentUser: User,
  ): Promise<void> {
    await this.findOne(leadId, currentUser); // Check access

    const contact = await this.leadContactRepository.findOne({
      where: { id: contactId, leadId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    await this.leadContactRepository.remove(contact);
    this.logger.log(`Contact ${contactId} deleted from lead ${leadId}`);
  }

  // ============ Pincode Lookup ============

  async lookupPincode(
    pincode: string,
  ): Promise<{ city: string; state: string; country: string } | null> {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
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
    } catch (error) {
      this.logger.error(`Pincode lookup failed for ${pincode}:`, error);
      return null;
    }
  }

  // ============ Bulk Upload ============

  async bulkUpload(
    leads: any[],
    currentUser: User,
  ): Promise<{ successful: number; failed: number; errors: any[] }> {
    const errors: any[] = [];
    let successful = 0;
    let failed = 0;

    // Get the default "New" status from LeadStatusMaster
    const { LeadStatusMaster } = await import('../entities');
    const statusMasterRepo =
      this.leadRepository.manager.getRepository(LeadStatusMaster);
    const newStatus = await statusMasterRepo.findOne({
      where: { name: 'New', isActive: true },
    });

    for (let i = 0; i < leads.length; i++) {
      try {
        const row = leads[i];

        // Validate required fields
        if (!row.phoneNumber || !row.name) {
          errors.push({
            row: i + 2, // +2 because row 1 is header, +1 for 1-based indexing
            error: 'Phone number and name are required',
          });
          failed++;
          continue;
        }

        // Check if lead already exists
        const existing = await this.leadRepository.findOne({
          where: { phoneNumber: row.phoneNumber, deletedAt: IsNull() },
        });

        if (existing) {
          errors.push({
            row: i + 2,
            error: `Lead with phone ${row.phoneNumber} already exists`,
          });
          failed++;
          continue;
        }

        // Create lead
        const lead = this.leadRepository.create({
          phoneNumber: row.phoneNumber,
          name: row.name,
          source: row.source,
          categoryId: row.categoryId || null,
          status: LeadStatus.NEW,
          statusMasterId: newStatus?.id,
          createdAt: row.date ? new Date(row.date) : new Date(),
        });

        await this.leadRepository.save(lead);
        successful++;
        this.logger.log(`Bulk uploaded lead: ${lead.phoneNumber}`);
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error.message || 'Unknown error',
        });
        failed++;
      }
    }

    return { successful, failed, errors };
  }

  async bulkUploadFromCsv(
    file: Express.Multer.File,
    currentUser: User,
  ): Promise<{
    total: number;
    created: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
  }> {
    const errors: Array<{ row: number; message: string }> = [];
    let created = 0;
    let skipped = 0;
    let total = 0;

    // Get the default "New" status from LeadStatusMaster
    const { LeadStatusMaster, Category } = await import('../entities');
    const statusMasterRepo =
      this.leadRepository.manager.getRepository(LeadStatusMaster);
    const categoryRepo = this.leadRepository.manager.getRepository(Category);

    const newStatus = await statusMasterRepo.findOne({
      where: { name: 'New', isActive: true },
    });

    // Get all categories for name matching
    const categories = await categoryRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
    });

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(file.buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          total = results.length;

          for (let i = 0; i < results.length; i++) {
            try {
              const row = results[i];
              const rowNumber = i + 2; // +2 because row 1 is header, +1 for 1-based indexing

              // Validate required fields
              if (!row.phoneNumber) {
                errors.push({
                  row: rowNumber,
                  message: 'Phone number is required',
                });
                skipped++;
                continue;
              }

              // Normalize phone number
              let phoneNumber = row.phoneNumber.toString().trim();
              if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+' + phoneNumber;
              }

              // Check if lead already exists
              const existing = await this.leadRepository.findOne({
                where: { phoneNumber, deletedAt: IsNull() },
              });

              if (existing) {
                errors.push({
                  row: rowNumber,
                  message: `Lead with phone ${phoneNumber} already exists`,
                });
                skipped++;
                continue;
              }

              // Find category by name if provided
              let categoryId: string | null = null;
              if (row.categoryName) {
                const category = categories.find(
                  (c) =>
                    c.name.toLowerCase() === row.categoryName.toLowerCase(),
                );
                if (category) {
                  categoryId = category.id;
                } else {
                  errors.push({
                    row: rowNumber,
                    message: `Category '${row.categoryName}' not found`,
                  });
                }
              }

              // Create lead
              const lead = this.leadRepository.create({
                phoneNumber,
                name: row.name?.trim() || `Customer ${phoneNumber.slice(-4)}`,
                email: row.email?.trim() || null,
                businessName: row.businessName?.trim() || null,
                categoryId,
                status: LeadStatus.NEW,
                statusMasterId: newStatus?.id,
                createdAt: new Date(),
              });

              await this.leadRepository.save(lead);
              created++;
              this.logger.log(`CSV bulk uploaded lead: ${lead.phoneNumber}`);
            } catch (error) {
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

  // ============ Custom Field Methods ============

  async getCustomFields(
    leadId: string,
    currentUser: User,
  ): Promise<LeadCustomField[]> {
    await this.findOne(leadId, currentUser); // Check access

    return this.leadCustomFieldRepository.find({
      where: { leadId },
      relations: ['fieldDefinition'],
    });
  }

  async setCustomField(
    leadId: string,
    fieldDefinitionId: string,
    value: string | null,
    arrayValue: string[] | null,
    currentUser: User,
  ): Promise<LeadCustomField> {
    await this.findOne(leadId, currentUser); // Check access

    // Verify field definition exists
    const fieldDef = await this.fieldDefinitionRepository.findOne({
      where: { id: fieldDefinitionId },
    });

    if (!fieldDef) {
      throw new NotFoundException(
        `Field definition with ID ${fieldDefinitionId} not found`,
      );
    }

    let customField = await this.leadCustomFieldRepository.findOne({
      where: { leadId, fieldDefinitionId },
    });

    if (customField) {
      customField.value = value || undefined;
      customField.arrayValue = arrayValue || undefined;
    } else {
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

  async bulkSetCustomFields(
    leadId: string,
    fields: {
      fieldDefinitionId: string;
      value?: string;
      arrayValue?: string[];
    }[],
    currentUser: User,
  ): Promise<LeadCustomField[]> {
    await this.findOne(leadId, currentUser); // Check access

    const results: LeadCustomField[] = [];

    for (const field of fields) {
      const result = await this.setCustomField(
        leadId,
        field.fieldDefinitionId,
        field.value || null,
        field.arrayValue || null,
        currentUser,
      );
      results.push(result);
    }

    return results;
  }

  async deleteCustomField(
    leadId: string,
    fieldDefinitionId: string,
    currentUser: User,
  ): Promise<void> {
    await this.findOne(leadId, currentUser); // Check access

    const customField = await this.leadCustomFieldRepository.findOne({
      where: { leadId, fieldDefinitionId },
    });

    if (customField) {
      await this.leadCustomFieldRepository.remove(customField);
      this.logger.log(
        `Deleted custom field ${fieldDefinitionId} for lead ${leadId}`,
      );
    }
  }

  async updateBusinessType(
    leadId: string,
    businessTypeId: string | null,
    currentUser: User,
  ): Promise<Lead> {
    const lead = await this.findOne(leadId, currentUser);

    // Verify business type exists if provided
    if (businessTypeId) {
      const businessType = await this.businessTypeRepository.findOne({
        where: { id: businessTypeId, deletedAt: IsNull() },
      });

      if (!businessType) {
        throw new NotFoundException(
          `Business type with ID ${businessTypeId} not found`,
        );
      }
    }

    lead.businessTypeId = businessTypeId || undefined;
    await this.leadRepository.save(lead);
    this.logger.log(
      `Lead ${leadId} business type updated to ${businessTypeId}`,
    );

    return this.findOne(leadId, currentUser);
  }

  async getLeadWithCustomFields(
    leadId: string,
    currentUser: User,
  ): Promise<Lead & { customFieldValues: Record<string, any> }> {
    const lead = await this.findOne(leadId, currentUser);
    const customFields = await this.getCustomFields(leadId, currentUser);

    // Transform custom fields into a key-value object
    const customFieldValues: Record<string, any> = {};
    for (const cf of customFields) {
      const fieldName = cf.fieldDefinition?.name || cf.fieldDefinitionId;
      customFieldValues[fieldName] = cf.arrayValue || cf.value;
    }

    return { ...lead, customFieldValues };
  }
}

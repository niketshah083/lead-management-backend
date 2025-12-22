# Dynamic Lead Status Implementation

## Overview

This document describes the complete implementation of dynamic lead statuses using the LeadStatusMaster system with proper 3NF database normalization.

## Architecture

### Database Design (3NF Normalized)

#### Before (Denormalized)

```
leads table:
├── id (PK)
├── phoneNumber
├── name
├── status (enum: 'new', 'contacted', 'qualified', 'negotiation', 'won', 'lost')
└── [other fields]

Frontend (hardcoded):
├── Status colors
├── Status icons
└── Status display names
```

#### After (3NF Normalized)

```
leads table:
├── id (PK)
├── phoneNumber
├── name
├── status (enum - for backward compatibility)
├── status_master_id (FK)
└── [other fields]

lead_status_masters table:
├── id (PK)
├── name (UNIQUE)
├── description
├── color
├── bgColor
├── icon
├── order
├── isActive
├── created_at
├── updated_at
├── deleted_at
```

### Benefits of 3NF Design

1. **No Data Redundancy**: Status properties stored once in master table
2. **Single Source of Truth**: All status information centralized
3. **Easy Maintenance**: Update status properties without code changes
4. **Scalability**: Add unlimited custom statuses
5. **Backward Compatibility**: Enum field preserved for legacy code

## Implementation Details

### 1. Database Layer

#### LeadStatusMaster Entity

```typescript
@Entity('lead_status_masters')
export class LeadStatusMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @Column({ default: '#EFF6FF' })
  bgColor: string;

  @Column({ default: 'pi-inbox' })
  icon: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

#### Lead Entity Updates

```typescript
@Entity('leads')
export class Lead {
  // ... existing fields ...

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column({ name: 'status_master_id', nullable: true })
  statusMasterId: string;

  @ManyToOne(() => LeadStatusMaster)
  @JoinColumn({ name: 'status_master_id' })
  statusMaster: LeadStatusMaster;
}
```

### 2. Service Layer

#### LeadStatusService

```typescript
@Injectable()
export class LeadStatusService {
  async findAll(): Promise<LeadStatusMaster[]>;
  async findOne(id: string): Promise<LeadStatusMaster>;
  async create(dto: CreateLeadStatusDto): Promise<LeadStatusMaster>;
  async update(id: string, dto: UpdateLeadStatusDto): Promise<LeadStatusMaster>;
  async delete(id: string): Promise<void>;
  async reorder(statuses: { id: string; order: number }[]): Promise<void>;
}
```

#### LeadService Updates

```typescript
async create(dto: CreateLeadDto): Promise<Lead> {
  // Get default "New" status from LeadStatusMaster
  const newStatus = await statusMasterRepo.findOne({
    where: { name: 'New', isActive: true }
  });

  const lead = this.leadRepository.create({
    ...dto,
    status: LeadStatus.NEW,
    statusMasterId: newStatus?.id
  });

  return this.leadRepository.save(lead);
}

async updateStatus(id: string, dto: UpdateStatusDto, currentUser: User): Promise<Lead> {
  const lead = await this.findOne(id, currentUser);

  // Get the status master for the new status
  const newStatusMaster = await statusMasterRepo.findOne({
    where: { name: dto.status, isActive: true }
  });

  lead.status = dto.status;
  if (newStatusMaster) {
    lead.statusMasterId = newStatusMaster.id;
  }

  return this.leadRepository.save(lead);
}
```

### 3. API Layer

#### LeadStatusController

```typescript
@Controller('lead-statuses')
export class LeadStatusController {
  @Get()
  async findAll(): Promise<IApiResponse<LeadStatusMaster[]>>

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse<LeadStatusMaster>>

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateLeadStatusDto): Promise<IApiResponse<LeadStatusMaster>>

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto): Promise<IApiResponse<LeadStatusMaster>>

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<IApiResponse<void>>

  @Put('reorder/all')
  @Roles(UserRole.ADMIN)
  async reorder(@Body() statuses: { id: string; order: number }[]): Promise<IApiResponse<void>>
}
```

### 4. Frontend Layer

#### LeadStatusService

```typescript
@Injectable()
export class LeadStatusService {
  getAll(): Observable<IApiResponse<ILeadStatus[]>>;
  getOne(id: string): Observable<IApiResponse<ILeadStatus>>;
  create(data: Partial<ILeadStatus>): Observable<IApiResponse<ILeadStatus>>;
  update(
    id: string,
    data: Partial<ILeadStatus>,
  ): Observable<IApiResponse<ILeadStatus>>;
  delete(id: string): Observable<IApiResponse<void>>;
  reorder(
    statuses: { id: string; order: number }[],
  ): Observable<IApiResponse<void>>;
}
```

#### Lead Model Updates

```typescript
export interface ILead {
  // ... existing fields ...
  status: LeadStatus;
  statusMasterId?: string;
  statusMaster?: {
    id: string;
    name: string;
    color: string;
    bgColor: string;
    icon: string;
  };
}
```

#### Kanban Component Updates

```typescript
export class LeadKanbanComponent implements OnInit {
  statuses = signal<ILeadStatus[]>([]);

  ngOnInit(): void {
    this.loadStatuses();
    this.loadLeads();
  }

  loadStatuses(): void {
    this.leadStatusService.getAll().subscribe({
      next: (response) => {
        this.statuses.set(response.data);
      },
    });
  }

  private groupByStatus(leads: ILead[]): DynamicColumn[] {
    return this.statuses().map((status) => {
      const columnLeads = leads.filter(
        (lead) => lead.statusMasterId === status.id,
      );
      return {
        id: status.id,
        title: status.name,
        color: status.color,
        bgColor: status.bgColor,
        icon: status.icon,
        leads: columnLeads,
        count: columnLeads.length,
      };
    });
  }
}
```

## Migrations

### Migration 1: CreateLeadStatusMaster (1734720000000)

- Creates `lead_status_masters` table
- Adds `status_master_id` column to `leads` table
- Creates foreign key relationship
- Inserts 6 default statuses

### Migration 2: PopulateLeadStatusMasterId (1734720100000)

- Maps existing enum statuses to LeadStatusMaster records
- Updates all existing leads with appropriate `statusMasterId`
- Ensures data consistency during transition

## Default Statuses

| ID   | Name        | Color   | BgColor | Icon            | Order |
| ---- | ----------- | ------- | ------- | --------------- | ----- |
| UUID | New         | #3B82F6 | #EFF6FF | pi-inbox        | 0     |
| UUID | Contacted   | #F59E0B | #FEF3C7 | pi-phone        | 1     |
| UUID | Qualified   | #8B5CF6 | #F3E8FF | pi-check-circle | 2     |
| UUID | Negotiation | #EC4899 | #FCE7F3 | pi-comments     | 3     |
| UUID | Won         | #10B981 | #D1FAE5 | pi-trophy       | 4     |
| UUID | Lost        | #EF4444 | #FEE2E2 | pi-times-circle | 5     |

## Data Flow

### Creating a Lead

```
1. User submits lead form
2. Frontend: POST /leads with lead data
3. Backend: LeadService.create()
   - Get default "New" status from LeadStatusMaster
   - Create lead with status enum and statusMasterId
   - Save to database
4. Response includes statusMaster object
5. Frontend: Display lead with dynamic status styling
```

### Updating Lead Status

```
1. User drags lead to new status column
2. Frontend: PUT /leads/:id/status with new status name
3. Backend: LeadService.updateStatus()
   - Find LeadStatusMaster record by name
   - Update lead.status enum
   - Update lead.statusMasterId
   - Create history record
   - Save to database
4. Response includes updated statusMaster
5. Frontend: Kanban updates with new status styling
```

### Bulk Upload

```
1. User uploads Excel file with leads
2. Frontend: POST /leads/bulk-upload with file data
3. Backend: LeadService.bulkUpload()
   - For each lead:
     - Get default "New" status
     - Create lead with statusMasterId
     - Save to database
4. Response includes success/failure counts
5. Frontend: Display upload results
```

## Admin Features

### Lead Status Management

- **View**: List all statuses with colors and icons
- **Create**: Add new custom statuses
- **Edit**: Modify status properties (color, icon, name)
- **Delete**: Soft delete statuses (sets deleted_at)
- **Reorder**: Change status order in kanban view

### UI Components

- Lead Status List: Table view of all statuses
- Status Form: Create/edit status dialog
- Color Picker: Select status colors
- Icon Selector: Choose status icons

## Performance Considerations

1. **Caching**: Frontend caches statuses in signal
2. **Lazy Loading**: Statuses loaded once on component init
3. **Indexing**: `name` column indexed for fast lookups
4. **Foreign Keys**: Proper indexing on `status_master_id`
5. **Soft Deletes**: Queries filter out deleted statuses

## Backward Compatibility

- **Enum Field Preserved**: `status` enum field remains for legacy code
- **Dual Storage**: Both `status` and `statusMasterId` maintained
- **Migration Path**: Existing leads automatically updated
- **Fallback Logic**: If statusMasterId missing, use enum value

## Testing Checklist

- [ ] Migrations run successfully
- [ ] All existing leads have statusMasterId populated
- [ ] Kanban displays dynamic statuses with correct colors
- [ ] Status update works correctly
- [ ] Bulk upload assigns correct statusMasterId
- [ ] Admin can create/edit/delete statuses
- [ ] Status reordering works
- [ ] Frontend displays statusMaster data
- [ ] API returns statusMaster in responses
- [ ] Soft deletes work correctly

## Troubleshooting

### Issue: statusMasterId is NULL

**Cause**: PopulateLeadStatusMasterId migration didn't run
**Solution**: Run migration manually or check migration logs

### Issue: Status not updating

**Cause**: Status name doesn't match LeadStatusMaster record
**Solution**: Verify status names match exactly (case-sensitive)

### Issue: Kanban not showing statuses

**Cause**: LeadStatusService.getAll() failed
**Solution**: Check API endpoint and error logs

## Future Enhancements

1. **Status Workflows**: Define allowed status transitions
2. **Status Automation**: Auto-update status based on rules
3. **Status Notifications**: Alert on status changes
4. **Status Analytics**: Track status distribution over time
5. **Custom Fields**: Add custom properties to statuses
6. **Status Templates**: Pre-defined status sets for different industries

## References

- Migration Guide: `backend/docs/MIGRATION_GUIDE.md`
- Lead Service: `backend/src/lead/lead.service.ts`
- Lead Status Service: `backend/src/lead-status/lead-status.service.ts`
- Kanban Component: `frontend/src/app/features/leads/components/lead-kanban/`
- Lead Status Component: `frontend/src/app/features/lead-status/`

# Lead Status Migration Guide

## Overview

This guide explains how to migrate existing leads to use the new dynamic LeadStatusMaster system.

## What Changed

### Before (Hardcoded Statuses)

- Lead statuses were stored as enum values in the `leads` table
- Status colors, icons, and display information were hardcoded in the frontend
- Adding new statuses required code changes

### After (Dynamic Statuses)

- Lead statuses are now managed through the `LeadStatusMaster` table
- Each lead has a `statusMasterId` foreign key pointing to the master status
- Statuses can be created, edited, and deleted through the admin UI
- Proper 3NF database normalization

## Database Schema Changes

### New Table: `lead_status_masters`

```sql
CREATE TABLE lead_status_masters (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description VARCHAR(255),
  color VARCHAR(7) DEFAULT '#3B82F6',
  bgColor VARCHAR(7) DEFAULT '#EFF6FF',
  icon VARCHAR(50) DEFAULT 'pi-inbox',
  order INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Updated Table: `leads`

```sql
ALTER TABLE leads ADD COLUMN status_master_id VARCHAR(36);
ALTER TABLE leads ADD FOREIGN KEY (status_master_id) REFERENCES lead_status_masters(id) ON DELETE SET NULL;
```

## Default Statuses Created

The following 6 default statuses are automatically created:

| Name        | Color   | Icon            | Order |
| ----------- | ------- | --------------- | ----- |
| New         | #3B82F6 | pi-inbox        | 0     |
| Contacted   | #F59E0B | pi-phone        | 1     |
| Qualified   | #8B5CF6 | pi-check-circle | 2     |
| Negotiation | #EC4899 | pi-comments     | 3     |
| Won         | #10B981 | pi-trophy       | 4     |
| Lost        | #EF4444 | pi-times-circle | 5     |

## Running the Migrations

### Step 1: Run the CreateLeadStatusMaster Migration

This creates the `lead_status_masters` table and inserts default statuses.

```bash
npm run typeorm migration:run
```

### Step 2: Run the PopulateLeadStatusMasterId Migration

This updates all existing leads with the appropriate `statusMasterId` based on their current status.

```bash
npm run typeorm migration:run
```

## Migration Details

### Migration 1: CreateLeadStatusMaster (1734720000000)

- Creates `lead_status_masters` table
- Adds `status_master_id` column to `leads` table
- Inserts 6 default statuses
- Creates foreign key relationship

### Migration 2: PopulateLeadStatusMasterId (1734720100000)

- Maps existing enum statuses to LeadStatusMaster records
- Updates all leads with matching `statusMasterId`
- Mapping:
  - `new` → `New`
  - `contacted` → `Contacted`
  - `qualified` → `Qualified`
  - `negotiation` → `Negotiation`
  - `won` → `Won`
  - `lost` → `Lost`

## Data Consistency

### Before Migration

```
leads table:
- id: uuid
- status: enum ('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost')
- status_master_id: NULL
```

### After Migration

```
leads table:
- id: uuid
- status: enum (unchanged for backward compatibility)
- status_master_id: uuid (references lead_status_masters.id)

lead_status_masters table:
- id: uuid
- name: varchar (matches status enum values)
- color, bgColor, icon: varchar (display properties)
```

## Rollback

If you need to rollback the migrations:

```bash
npm run typeorm migration:revert
npm run typeorm migration:revert
```

This will:

1. Clear all `statusMasterId` values from leads
2. Drop the `status_master_id` column
3. Drop the `lead_status_masters` table

## Verification

After running migrations, verify the data:

```sql
-- Check default statuses were created
SELECT * FROM lead_status_masters WHERE deleted_at IS NULL;

-- Check leads have statusMasterId populated
SELECT COUNT(*) as total_leads,
       COUNT(status_master_id) as leads_with_status_master_id
FROM leads WHERE deleted_at IS NULL;

-- Check status distribution
SELECT lsm.name, COUNT(l.id) as lead_count
FROM leads l
LEFT JOIN lead_status_masters lsm ON l.status_master_id = lsm.id
WHERE l.deleted_at IS NULL
GROUP BY lsm.name;
```

## API Changes

### Lead Endpoints

All lead endpoints now return `statusMaster` object:

```json
{
  "id": "uuid",
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "status": "contacted",
  "statusMasterId": "uuid",
  "statusMaster": {
    "id": "uuid",
    "name": "Contacted",
    "color": "#F59E0B",
    "bgColor": "#FEF3C7",
    "icon": "pi-phone"
  }
}
```

### Status Update

When updating lead status, use the status name:

```bash
PUT /leads/:id/status
{
  "status": "qualified",
  "notes": "Lead meets all criteria"
}
```

The system will automatically:

1. Update the `status` enum field
2. Find the matching `LeadStatusMaster` record
3. Update the `statusMasterId` field

## Frontend Changes

### Kanban View

- Columns are now dynamically generated from `LeadStatusMaster`
- Colors and icons are fetched from the database
- Admins can customize status appearance in real-time

### Lead List

- Status filter now uses dynamic statuses
- Status badges display with dynamic colors

## Best Practices

1. **Don't modify the status enum** - It's kept for backward compatibility
2. **Use the admin UI** to manage statuses - Don't modify the database directly
3. **Test migrations** in a development environment first
4. **Backup your database** before running migrations
5. **Monitor the migration** - Check logs for any errors

## Troubleshooting

### Issue: statusMasterId is NULL after migration

**Solution**: Ensure the PopulateLeadStatusMasterId migration ran successfully. Check that the status names in `lead_status_masters` exactly match the mapping in the migration.

### Issue: Foreign key constraint error

**Solution**: Ensure all leads have valid status values that match a record in `lead_status_masters`.

### Issue: Duplicate status names

**Solution**: The `name` column has a UNIQUE constraint. Ensure no duplicate status names exist.

## Support

For issues or questions, refer to:

- Backend: `backend/src/lead/lead.service.ts`
- Migrations: `backend/src/migrations/`
- Frontend: `frontend/src/app/core/services/lead-status.service.ts`

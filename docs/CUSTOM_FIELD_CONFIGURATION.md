# Custom Field Configuration System

## Overview

This document describes the dynamic custom field configuration system that allows businesses to configure lead fields based on their industry type (Manufacturing, IT Services, SaaS, Retail, Consulting, etc.).

## Architecture

### Database Schema

```
┌─────────────────────┐     ┌─────────────────────┐
│   business_types    │     │  field_definitions  │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │────<│ id (PK)             │
│ name                │     │ business_type_id(FK)│
│ description         │     │ name                │
│ icon                │     │ label               │
│ color               │     │ field_type          │
│ is_active           │     │ placeholder         │
│ order               │     │ help_text           │
└─────────────────────┘     │ is_required         │
                            │ is_active           │
                            │ order               │
                            │ options (JSON)      │
                            │ validation (JSON)   │
                            │ default_value       │
                            │ visibility_condition│
                            └─────────────────────┘
                                      │
                                      │
                            ┌─────────────────────┐
                            │  lead_custom_fields │
                            ├─────────────────────┤
                            │ id (PK)             │
                            │ lead_id (FK)        │
                            │ field_definition_id │
                            │ value               │
                            │ array_value (JSON)  │
                            └─────────────────────┘
```

### Status Workflow Configuration

```
┌─────────────────────┐     ┌─────────────────────┐
│ lead_status_masters │     │  status_transitions │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │────<│ id (PK)             │
│ name                │     │ from_status_id (FK) │
│ description         │     │ to_status_id (FK)   │
│ color               │     │ is_active           │
│ bg_color            │     │ requires_comment    │
│ icon                │     │ allowed_roles (JSON)│
│ order               │     └─────────────────────┘
│ is_active           │
│ is_initial          │
│ is_final            │
│ status_type         │
└─────────────────────┘
```

## Field Types

| Type           | Description      | Use Case                  |
| -------------- | ---------------- | ------------------------- |
| `text`         | Single line text | Names, short descriptions |
| `number`       | Numeric input    | Quantities, counts        |
| `date`         | Date picker      | Delivery dates, deadlines |
| `dropdown`     | Single select    | Categories, types         |
| `multi_select` | Multiple select  | Technologies, features    |
| `checkbox`     | Boolean toggle   | Yes/No options            |
| `email`        | Email input      | Contact emails            |
| `phone`        | Phone input      | Contact numbers           |
| `url`          | URL input        | Website links             |
| `textarea`     | Multi-line text  | Descriptions, notes       |
| `currency`     | Currency input   | Budgets, prices           |

## API Endpoints

### Business Types

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/business-types`         | List all business types              |
| GET    | `/business-types/:id`     | Get single business type with fields |
| POST   | `/business-types`         | Create business type                 |
| PUT    | `/business-types/:id`     | Update business type                 |
| DELETE | `/business-types/:id`     | Delete business type                 |
| PUT    | `/business-types/reorder` | Reorder business types               |

### Field Definitions

| Method | Endpoint                             | Description                  |
| ------ | ------------------------------------ | ---------------------------- |
| GET    | `/business-types/:id/fields`         | Get fields for business type |
| POST   | `/business-types/:id/fields`         | Create field                 |
| PUT    | `/business-types/fields/:fieldId`    | Update field                 |
| DELETE | `/business-types/fields/:fieldId`    | Delete field                 |
| PUT    | `/business-types/:id/fields/reorder` | Reorder fields               |

### Lead Custom Fields

| Method | Endpoint                            | Description                       |
| ------ | ----------------------------------- | --------------------------------- |
| GET    | `/leads/:id/custom-fields`          | Get lead's custom field values    |
| PUT    | `/leads/:id/custom-fields/:fieldId` | Set single field value            |
| PUT    | `/leads/:id/custom-fields`          | Bulk set field values             |
| DELETE | `/leads/:id/custom-fields/:fieldId` | Delete field value                |
| PUT    | `/leads/:id/business-type`          | Update lead's business type       |
| GET    | `/leads/:id/with-custom-fields`     | Get lead with custom field values |

### Status Transitions

| Method | Endpoint                           | Description                 |
| ------ | ---------------------------------- | --------------------------- |
| GET    | `/lead-statuses/transitions/all`   | Get all transitions         |
| GET    | `/lead-statuses/:id/transitions`   | Get transitions from status |
| GET    | `/lead-statuses/:id/allowed-next`  | Get allowed next statuses   |
| POST   | `/lead-statuses/transitions`       | Create transition           |
| POST   | `/lead-statuses/transitions/bulk`  | Bulk create transitions     |
| PUT    | `/lead-statuses/transitions/:id`   | Update transition           |
| DELETE | `/lead-statuses/transitions/:id`   | Delete transition           |
| GET    | `/lead-statuses/transitions/check` | Check if transition allowed |

## Usage Examples

### Creating a Business Type

```typescript
POST /business-types
{
  "name": "Manufacturing",
  "description": "Manufacturing and production companies",
  "icon": "pi-cog",
  "color": "#F59E0B"
}
```

### Adding a Field

```typescript
POST /business-types/{businessTypeId}/fields
{
  "name": "product_category",
  "label": "Product Category",
  "fieldType": "dropdown",
  "placeholder": "Select category",
  "isRequired": true,
  "options": [
    { "label": "Electronics", "value": "electronics" },
    { "label": "Machinery", "value": "machinery" }
  ]
}
```

### Setting Custom Field Values

```typescript
PUT /leads/{leadId}/custom-fields
{
  "fields": [
    { "fieldDefinitionId": "uuid-1", "value": "electronics" },
    { "fieldDefinitionId": "uuid-2", "value": "1000" },
    { "fieldDefinitionId": "uuid-3", "arrayValue": ["react", "nodejs"] }
  ]
}
```

### Creating Status Transitions

```typescript
POST /lead-statuses/transitions/bulk
{
  "fromStatusId": "new-status-id",
  "toStatusIds": ["contacted-id", "qualified-id", "lost-id"],
  "requiresComment": false
}
```

## Pre-configured Business Types

The system comes with 5 pre-configured business types:

1. **Manufacturing** - Product category, quantity, delivery, specifications
2. **IT Services** - Service type, technology stack, project duration, budget
3. **SaaS** - Plan interest, user count, integrations, billing cycle
4. **Retail** - Store type, product categories, store count, revenue
5. **Consulting** - Consulting area, company size, engagement type

## Frontend Integration

### Business Type Configuration Page

Navigate to `/business-types` to:

- Create/edit business types
- Add/edit/delete custom fields
- Reorder fields via drag-drop

### Lead Detail Page

When a lead has a business type assigned:

- Custom fields are displayed in a dedicated section
- Fields render based on their type (dropdown, text, etc.)
- Values are saved automatically or via save button

### Dynamic Form Component

Use `<app-dynamic-field-form>` component:

```html
<app-dynamic-field-form
  [fields]="customFields"
  [values]="customFieldValues"
  (save)="onSaveCustomFields($event)"
/>
```

## Migration

Run the migration to create the new tables:

```bash
npm run migration:run
```

This will:

1. Create `business_types` table
2. Create `field_definitions` table
3. Create `lead_custom_fields` table
4. Create `status_transitions` table
5. Add `business_type_id` to `leads` table
6. Add `is_initial`, `is_final`, `status_type` to `lead_status_masters`
7. Seed sample business types and fields

## Best Practices

1. **Field Naming**: Use snake_case for field names (e.g., `product_category`)
2. **Required Fields**: Only mark truly essential fields as required
3. **Options**: Keep dropdown options concise and relevant
4. **Validation**: Use validation rules for data integrity
5. **Help Text**: Provide clear guidance for complex fields
6. **Status Transitions**: Define clear workflow paths
7. **Role Restrictions**: Use `allowedRoles` for sensitive transitions

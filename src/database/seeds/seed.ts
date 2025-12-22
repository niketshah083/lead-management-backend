import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../../data-source';
import {
  UserRole,
  LeadStatus,
  NotificationEventType,
} from '../../common/enums';

async function seed(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Create Admin user
    const adminId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await queryRunner.query(
      `
      INSERT INTO users (id, email, password_hash, name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        adminId,
        'admin@example.com',
        adminPasswordHash,
        'System Admin',
        '+1234567890',
        UserRole.ADMIN,
        true,
      ],
    );

    // Create Manager user
    const managerId = uuidv4();
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    await queryRunner.query(
      `
      INSERT INTO users (id, email, password_hash, name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        managerId,
        'manager@example.com',
        managerPasswordHash,
        'Sales Manager',
        '+1234567891',
        UserRole.MANAGER,
        true,
      ],
    );

    // Create Customer Executive users
    const ce1Id = uuidv4();
    const ce1PasswordHash = await bcrypt.hash('ce123', 10);
    await queryRunner.query(
      `
      INSERT INTO users (id, email, password_hash, name, phone, role, manager_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        ce1Id,
        'ce1@example.com',
        ce1PasswordHash,
        'John Doe',
        '+1234567892',
        UserRole.CUSTOMER_EXECUTIVE,
        managerId,
        true,
      ],
    );

    const ce2Id = uuidv4();
    const ce2PasswordHash = await bcrypt.hash('ce123', 10);
    await queryRunner.query(
      `
      INSERT INTO users (id, email, password_hash, name, phone, role, manager_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        ce2Id,
        'ce2@example.com',
        ce2PasswordHash,
        'Jane Smith',
        '+1234567893',
        UserRole.CUSTOMER_EXECUTIVE,
        managerId,
        true,
      ],
    );

    // Create Categories
    const uvPrinterId = uuidv4();
    await queryRunner.query(
      `
      INSERT INTO categories (id, name, description, keywords, is_active)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        uvPrinterId,
        'UV Printers',
        'High-quality UV printing machines for various applications',
        JSON.stringify(['uv', 'printer', 'printing', 'uv printer', 'flatbed']),
        true,
      ],
    );

    const fiberLaserId = uuidv4();
    await queryRunner.query(
      `
      INSERT INTO categories (id, name, description, keywords, is_active)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        fiberLaserId,
        'Fiber Laser Machines',
        'Industrial fiber laser cutting and engraving machines',
        JSON.stringify([
          'laser',
          'fiber',
          'cutting',
          'engraving',
          'fiber laser',
        ]),
        true,
      ],
    );

    const cncRouterId = uuidv4();
    await queryRunner.query(
      `
      INSERT INTO categories (id, name, description, keywords, is_active)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        cncRouterId,
        'CNC Routers',
        'Computer-controlled routing machines for precision cutting',
        JSON.stringify([
          'cnc',
          'router',
          'routing',
          'cnc router',
          'woodworking',
        ]),
        true,
      ],
    );

    // Assign categories to Customer Executives
    await queryRunner.query(
      `
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `,
      [uuidv4(), ce1Id, uvPrinterId],
    );

    await queryRunner.query(
      `
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `,
      [uuidv4(), ce1Id, fiberLaserId],
    );

    await queryRunner.query(
      `
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `,
      [uuidv4(), ce2Id, fiberLaserId],
    );

    await queryRunner.query(
      `
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `,
      [uuidv4(), ce2Id, cncRouterId],
    );

    // Create Auto-Reply Templates
    await queryRunner.query(
      `
      INSERT INTO auto_reply_templates (id, category_id, trigger_keyword, message_content, priority, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        uvPrinterId,
        'price',
        'Thank you for your interest in our UV Printers! Our team will get back to you shortly with pricing details.',
        10,
        true,
      ],
    );

    await queryRunner.query(
      `
      INSERT INTO auto_reply_templates (id, category_id, trigger_keyword, message_content, priority, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        fiberLaserId,
        fiberLaserId,
        'price',
        'Thank you for your interest in our Fiber Laser Machines! Our team will get back to you shortly with pricing details.',
        10,
        true,
      ],
    );

    // Create SLA Policy
    const slaPolicyId = uuidv4();
    await queryRunner.query(
      `
      INSERT INTO sla_policies (id, name, first_response_minutes, follow_up_minutes, resolution_minutes, warning_threshold_percent, is_default, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [slaPolicyId, 'Standard SLA', 30, 120, 1440, 80, true, true],
    );

    // Create Notification Configs
    await queryRunner.query(
      `
      INSERT INTO notification_configs (id, event_type, email_enabled, push_enabled, recipient_roles)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        NotificationEventType.NEW_LEAD,
        true,
        true,
        JSON.stringify([UserRole.CUSTOMER_EXECUTIVE]),
      ],
    );

    await queryRunner.query(
      `
      INSERT INTO notification_configs (id, event_type, email_enabled, push_enabled, recipient_roles)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        NotificationEventType.SLA_WARNING,
        true,
        true,
        JSON.stringify([UserRole.CUSTOMER_EXECUTIVE, UserRole.MANAGER]),
      ],
    );

    await queryRunner.query(
      `
      INSERT INTO notification_configs (id, event_type, email_enabled, push_enabled, recipient_roles)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        NotificationEventType.SLA_BREACH,
        true,
        true,
        JSON.stringify([UserRole.MANAGER, UserRole.ADMIN]),
      ],
    );

    await queryRunner.commitTransaction();
    console.log('Seed data inserted successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// Run seed
AppDataSource.initialize()
  .then(async (dataSource) => {
    await seed(dataSource);
    await dataSource.destroy();
  })
  .catch((error) => {
    console.error('Error initializing data source:', error);
    process.exit(1);
  });

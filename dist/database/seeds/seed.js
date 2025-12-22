"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const data_source_1 = require("../../data-source");
const enums_1 = require("../../common/enums");
async function seed(dataSource) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const adminId = (0, uuid_1.v4)();
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        await queryRunner.query(`
      INSERT INTO users (id, email, password_hash, name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            adminId,
            'admin@example.com',
            adminPasswordHash,
            'System Admin',
            '+1234567890',
            enums_1.UserRole.ADMIN,
            true,
        ]);
        const managerId = (0, uuid_1.v4)();
        const managerPasswordHash = await bcrypt.hash('manager123', 10);
        await queryRunner.query(`
      INSERT INTO users (id, email, password_hash, name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            managerId,
            'manager@example.com',
            managerPasswordHash,
            'Sales Manager',
            '+1234567891',
            enums_1.UserRole.MANAGER,
            true,
        ]);
        const ce1Id = (0, uuid_1.v4)();
        const ce1PasswordHash = await bcrypt.hash('ce123', 10);
        await queryRunner.query(`
      INSERT INTO users (id, email, password_hash, name, phone, role, manager_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            ce1Id,
            'ce1@example.com',
            ce1PasswordHash,
            'John Doe',
            '+1234567892',
            enums_1.UserRole.CUSTOMER_EXECUTIVE,
            managerId,
            true,
        ]);
        const ce2Id = (0, uuid_1.v4)();
        const ce2PasswordHash = await bcrypt.hash('ce123', 10);
        await queryRunner.query(`
      INSERT INTO users (id, email, password_hash, name, phone, role, manager_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            ce2Id,
            'ce2@example.com',
            ce2PasswordHash,
            'Jane Smith',
            '+1234567893',
            enums_1.UserRole.CUSTOMER_EXECUTIVE,
            managerId,
            true,
        ]);
        const uvPrinterId = (0, uuid_1.v4)();
        await queryRunner.query(`
      INSERT INTO categories (id, name, description, keywords, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [
            uvPrinterId,
            'UV Printers',
            'High-quality UV printing machines for various applications',
            JSON.stringify(['uv', 'printer', 'printing', 'uv printer', 'flatbed']),
            true,
        ]);
        const fiberLaserId = (0, uuid_1.v4)();
        await queryRunner.query(`
      INSERT INTO categories (id, name, description, keywords, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [
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
        ]);
        const cncRouterId = (0, uuid_1.v4)();
        await queryRunner.query(`
      INSERT INTO categories (id, name, description, keywords, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [
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
        ]);
        await queryRunner.query(`
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `, [(0, uuid_1.v4)(), ce1Id, uvPrinterId]);
        await queryRunner.query(`
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `, [(0, uuid_1.v4)(), ce1Id, fiberLaserId]);
        await queryRunner.query(`
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `, [(0, uuid_1.v4)(), ce2Id, fiberLaserId]);
        await queryRunner.query(`
      INSERT INTO user_categories (id, user_id, category_id)
      VALUES (?, ?, ?)
    `, [(0, uuid_1.v4)(), ce2Id, cncRouterId]);
        await queryRunner.query(`
      INSERT INTO auto_reply_templates (id, category_id, trigger_keyword, message_content, priority, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(),
            uvPrinterId,
            'price',
            'Thank you for your interest in our UV Printers! Our team will get back to you shortly with pricing details.',
            10,
            true,
        ]);
        await queryRunner.query(`
      INSERT INTO auto_reply_templates (id, category_id, trigger_keyword, message_content, priority, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
            fiberLaserId,
            fiberLaserId,
            'price',
            'Thank you for your interest in our Fiber Laser Machines! Our team will get back to you shortly with pricing details.',
            10,
            true,
        ]);
        const slaPolicyId = (0, uuid_1.v4)();
        await queryRunner.query(`
      INSERT INTO sla_policies (id, name, first_response_minutes, follow_up_minutes, resolution_minutes, warning_threshold_percent, is_default, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [slaPolicyId, 'Standard SLA', 30, 120, 1440, 80, true, true]);
        await queryRunner.query(`
      INSERT INTO notification_configs (id, event_type, email_enabled, push_enabled, recipient_roles)
      VALUES (?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(),
            enums_1.NotificationEventType.NEW_LEAD,
            true,
            true,
            JSON.stringify([enums_1.UserRole.CUSTOMER_EXECUTIVE]),
        ]);
        await queryRunner.query(`
      INSERT INTO notification_configs (id, event_type, email_enabled, push_enabled, recipient_roles)
      VALUES (?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(),
            enums_1.NotificationEventType.SLA_WARNING,
            true,
            true,
            JSON.stringify([enums_1.UserRole.CUSTOMER_EXECUTIVE, enums_1.UserRole.MANAGER]),
        ]);
        await queryRunner.query(`
      INSERT INTO notification_configs (id, event_type, email_enabled, push_enabled, recipient_roles)
      VALUES (?, ?, ?, ?, ?)
    `, [
            (0, uuid_1.v4)(),
            enums_1.NotificationEventType.SLA_BREACH,
            true,
            true,
            JSON.stringify([enums_1.UserRole.MANAGER, enums_1.UserRole.ADMIN]),
        ]);
        await queryRunner.commitTransaction();
        console.log('Seed data inserted successfully!');
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error seeding data:', error);
        throw error;
    }
    finally {
        await queryRunner.release();
    }
}
data_source_1.AppDataSource.initialize()
    .then(async (dataSource) => {
    await seed(dataSource);
    await dataSource.destroy();
})
    .catch((error) => {
    console.error('Error initializing data source:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1734519600000 implements MigrationInterface {
  name = 'InitialSchema1734519600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`phone\` varchar(255) NULL,
        \`role\` enum('admin', 'manager', 'customer_executive') NOT NULL,
        \`manager_id\` varchar(36) NULL,
        \`fcm_token\` varchar(255) NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE \`categories\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`keywords\` json NOT NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        UNIQUE INDEX \`IDX_categories_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create category_media table
    await queryRunner.query(`
      CREATE TABLE \`category_media\` (
        \`id\` varchar(36) NOT NULL,
        \`category_id\` varchar(36) NOT NULL,
        \`url\` varchar(255) NOT NULL,
        \`type\` enum('image', 'video', 'document') NOT NULL,
        \`filename\` varchar(255) NOT NULL,
        \`size\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create auto_reply_templates table
    await queryRunner.query(`
      CREATE TABLE \`auto_reply_templates\` (
        \`id\` varchar(36) NOT NULL,
        \`category_id\` varchar(36) NOT NULL,
        \`trigger_keyword\` varchar(255) NOT NULL,
        \`message_content\` text NOT NULL,
        \`priority\` int NOT NULL DEFAULT 0,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create user_categories table
    await queryRunner.query(`
      CREATE TABLE \`user_categories\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`category_id\` varchar(36) NOT NULL,
        \`assigned_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create leads table
    await queryRunner.query(`
      CREATE TABLE \`leads\` (
        \`id\` varchar(36) NOT NULL,
        \`phone_number\` varchar(255) NOT NULL,
        \`name\` varchar(255) NULL,
        \`category_id\` varchar(36) NOT NULL,
        \`status\` enum('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost') NOT NULL DEFAULT 'new',
        \`assigned_to_id\` varchar(36) NULL,
        \`claimed_at\` datetime NULL,
        \`is_qualified\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE \`messages\` (
        \`id\` varchar(36) NOT NULL,
        \`lead_id\` varchar(36) NOT NULL,
        \`direction\` enum('inbound', 'outbound') NOT NULL,
        \`content\` text NOT NULL,
        \`media_url\` varchar(255) NULL,
        \`media_type\` enum('image', 'video', 'document') NULL,
        \`sent_by_id\` varchar(36) NULL,
        \`status\` enum('pending', 'sent', 'delivered', 'read', 'failed') NOT NULL DEFAULT 'pending',
        \`is_auto_reply\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create lead_history table
    await queryRunner.query(`
      CREATE TABLE \`lead_history\` (
        \`id\` varchar(36) NOT NULL,
        \`lead_id\` varchar(36) NOT NULL,
        \`previous_status\` enum('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost') NULL,
        \`new_status\` enum('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost') NOT NULL,
        \`changed_by_id\` varchar(36) NOT NULL,
        \`notes\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create sla_policies table
    await queryRunner.query(`
      CREATE TABLE \`sla_policies\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`first_response_minutes\` int NOT NULL,
        \`follow_up_minutes\` int NOT NULL,
        \`resolution_minutes\` int NOT NULL,
        \`warning_threshold_percent\` int NOT NULL DEFAULT 80,
        \`is_default\` tinyint NOT NULL DEFAULT 0,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create sla_tracking table
    await queryRunner.query(`
      CREATE TABLE \`sla_tracking\` (
        \`id\` varchar(36) NOT NULL,
        \`lead_id\` varchar(36) NOT NULL,
        \`policy_id\` varchar(36) NOT NULL,
        \`first_response_due\` datetime NOT NULL,
        \`first_response_at\` datetime NULL,
        \`first_response_breached\` tinyint NOT NULL DEFAULT 0,
        \`resolution_due\` datetime NOT NULL,
        \`resolved_at\` datetime NULL,
        \`resolution_breached\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_sla_tracking_lead_id\` (\`lead_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create notification_configs table
    await queryRunner.query(`
      CREATE TABLE \`notification_configs\` (
        \`id\` varchar(36) NOT NULL,
        \`event_type\` enum('new_lead', 'lead_assigned', 'lead_claimed', 'new_message', 'sla_warning', 'sla_breach', 'lead_status_change') NOT NULL,
        \`email_enabled\` tinyint NOT NULL DEFAULT 1,
        \`push_enabled\` tinyint NOT NULL DEFAULT 1,
        \`recipient_roles\` json NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create notification_logs table
    await queryRunner.query(`
      CREATE TABLE \`notification_logs\` (
        \`id\` varchar(36) NOT NULL,
        \`config_id\` varchar(36) NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`channel\` enum('email', 'push') NOT NULL,
        \`subject\` varchar(255) NOT NULL,
        \`content\` text NOT NULL,
        \`status\` enum('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
        \`sent_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD CONSTRAINT \`FK_users_manager\` FOREIGN KEY (\`manager_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`category_media\`
      ADD CONSTRAINT \`FK_category_media_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`auto_reply_templates\`
      ADD CONSTRAINT \`FK_auto_reply_templates_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`user_categories\`
      ADD CONSTRAINT \`FK_user_categories_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`user_categories\`
      ADD CONSTRAINT \`FK_user_categories_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`leads\`
      ADD CONSTRAINT \`FK_leads_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`leads\`
      ADD CONSTRAINT \`FK_leads_assigned_to\` FOREIGN KEY (\`assigned_to_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`messages\`
      ADD CONSTRAINT \`FK_messages_lead\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`messages\`
      ADD CONSTRAINT \`FK_messages_sent_by\` FOREIGN KEY (\`sent_by_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`lead_history\`
      ADD CONSTRAINT \`FK_lead_history_lead\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`lead_history\`
      ADD CONSTRAINT \`FK_lead_history_changed_by\` FOREIGN KEY (\`changed_by_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`sla_tracking\`
      ADD CONSTRAINT \`FK_sla_tracking_lead\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`sla_tracking\`
      ADD CONSTRAINT \`FK_sla_tracking_policy\` FOREIGN KEY (\`policy_id\`) REFERENCES \`sla_policies\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`notification_logs\`
      ADD CONSTRAINT \`FK_notification_logs_config\` FOREIGN KEY (\`config_id\`) REFERENCES \`notification_configs\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`notification_logs\`
      ADD CONSTRAINT \`FK_notification_logs_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE \`notification_logs\` DROP FOREIGN KEY \`FK_notification_logs_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_logs\` DROP FOREIGN KEY \`FK_notification_logs_config\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sla_tracking\` DROP FOREIGN KEY \`FK_sla_tracking_policy\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sla_tracking\` DROP FOREIGN KEY \`FK_sla_tracking_lead\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_changed_by\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_lead\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_messages_sent_by\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_messages_lead\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_leads_assigned_to\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_leads_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_categories\` DROP FOREIGN KEY \`FK_user_categories_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_categories\` DROP FOREIGN KEY \`FK_user_categories_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auto_reply_templates\` DROP FOREIGN KEY \`FK_auto_reply_templates_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`category_media\` DROP FOREIGN KEY \`FK_category_media_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_manager\``,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE \`notification_logs\``);
    await queryRunner.query(`DROP TABLE \`notification_configs\``);
    await queryRunner.query(`DROP TABLE \`sla_tracking\``);
    await queryRunner.query(`DROP TABLE \`sla_policies\``);
    await queryRunner.query(`DROP TABLE \`lead_history\``);
    await queryRunner.query(`DROP TABLE \`messages\``);
    await queryRunner.query(`DROP TABLE \`leads\``);
    await queryRunner.query(`DROP TABLE \`user_categories\``);
    await queryRunner.query(`DROP TABLE \`auto_reply_templates\``);
    await queryRunner.query(`DROP TABLE \`category_media\``);
    await queryRunner.query(`DROP TABLE \`categories\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class SeedBusinessTypes1734850100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sample business types
    const manufacturingId = uuidv4();
    const itServicesId = uuidv4();
    const saasId = uuidv4();
    const retailId = uuidv4();
    const consultingId = uuidv4();

    // Insert business types
    await queryRunner.query(`
      INSERT INTO business_types (id, name, description, icon, color, \`order\`) VALUES
      ('${manufacturingId}', 'Manufacturing', 'Manufacturing and production companies', 'pi-cog', '#F59E0B', 1),
      ('${itServicesId}', 'IT Services', 'IT consulting and software development', 'pi-desktop', '#3B82F6', 2),
      ('${saasId}', 'SaaS', 'Software as a Service companies', 'pi-cloud', '#8B5CF6', 3),
      ('${retailId}', 'Retail', 'Retail and e-commerce businesses', 'pi-shopping-cart', '#10B981', 4),
      ('${consultingId}', 'Consulting', 'Business and management consulting', 'pi-briefcase', '#EC4899', 5)
    `);

    // Insert field definitions for Manufacturing
    await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${uuidv4()}', '${manufacturingId}', 'product_category', 'Product Category', 'dropdown', 'Select category', true, 1, '${JSON.stringify(
        [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Machinery', value: 'machinery' },
          { label: 'Textiles', value: 'textiles' },
          { label: 'Chemicals', value: 'chemicals' },
          { label: 'Food & Beverage', value: 'food_beverage' },
          { label: 'Automotive', value: 'automotive' },
          { label: 'Other', value: 'other' },
        ],
      )}'),
      ('${uuidv4()}', '${manufacturingId}', 'quantity_required', 'Quantity Required', 'number', 'Enter quantity', true, 2, NULL),
      ('${uuidv4()}', '${manufacturingId}', 'delivery_location', 'Delivery Location', 'text', 'Enter delivery address', false, 3, NULL),
      ('${uuidv4()}', '${manufacturingId}', 'expected_delivery_date', 'Expected Delivery Date', 'date', '', false, 4, NULL),
      ('${uuidv4()}', '${manufacturingId}', 'material_specifications', 'Material Specifications', 'textarea', 'Enter specifications', false, 5, NULL),
      ('${uuidv4()}', '${manufacturingId}', 'budget_range', 'Budget Range', 'currency', 'Enter budget', false, 6, NULL)
    `);

    // Insert field definitions for IT Services
    await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${uuidv4()}', '${itServicesId}', 'service_type', 'Service Type', 'dropdown', 'Select service', true, 1, '${JSON.stringify(
        [
          { label: 'Software Development', value: 'development' },
          { label: 'IT Support', value: 'support' },
          { label: 'Cloud Services', value: 'cloud' },
          { label: 'Cybersecurity', value: 'security' },
          { label: 'Data Analytics', value: 'analytics' },
          { label: 'Consulting', value: 'consulting' },
        ],
      )}'),
      ('${uuidv4()}', '${itServicesId}', 'technology_stack', 'Technology Stack', 'multi_select', 'Select technologies', false, 2, '${JSON.stringify(
        [
          { label: 'React', value: 'react' },
          { label: 'Angular', value: 'angular' },
          { label: 'Node.js', value: 'nodejs' },
          { label: 'Python', value: 'python' },
          { label: 'Java', value: 'java' },
          { label: '.NET', value: 'dotnet' },
          { label: 'AWS', value: 'aws' },
          { label: 'Azure', value: 'azure' },
          { label: 'GCP', value: 'gcp' },
        ],
      )}'),
      ('${uuidv4()}', '${itServicesId}', 'project_duration', 'Project Duration (months)', 'number', 'Enter duration', false, 3, NULL),
      ('${uuidv4()}', '${itServicesId}', 'team_size', 'Required Team Size', 'number', 'Enter team size', false, 4, NULL),
      ('${uuidv4()}', '${itServicesId}', 'budget', 'Budget', 'currency', 'Enter budget', false, 5, NULL),
      ('${uuidv4()}', '${itServicesId}', 'project_description', 'Project Description', 'textarea', 'Describe the project', false, 6, NULL)
    `);

    // Insert field definitions for SaaS
    await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${uuidv4()}', '${saasId}', 'plan_interest', 'Plan Interest', 'dropdown', 'Select plan', true, 1, '${JSON.stringify(
        [
          { label: 'Basic', value: 'basic' },
          { label: 'Professional', value: 'pro' },
          { label: 'Enterprise', value: 'enterprise' },
          { label: 'Custom', value: 'custom' },
        ],
      )}'),
      ('${uuidv4()}', '${saasId}', 'number_of_users', 'Number of Users', 'number', 'Enter user count', true, 2, NULL),
      ('${uuidv4()}', '${saasId}', 'integration_requirements', 'Integration Requirements', 'multi_select', 'Select integrations', false, 3, '${JSON.stringify(
        [
          { label: 'Salesforce', value: 'salesforce' },
          { label: 'HubSpot', value: 'hubspot' },
          { label: 'Slack', value: 'slack' },
          { label: 'Microsoft Teams', value: 'teams' },
          { label: 'Zapier', value: 'zapier' },
          { label: 'API Access', value: 'api' },
        ],
      )}'),
      ('${uuidv4()}', '${saasId}', 'current_tools', 'Current Tools', 'textarea', 'List current tools', false, 4, NULL),
      ('${uuidv4()}', '${saasId}', 'billing_cycle', 'Preferred Billing Cycle', 'dropdown', 'Select billing', false, 5, '${JSON.stringify(
        [
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Annual', value: 'annual' },
        ],
      )}'),
      ('${uuidv4()}', '${saasId}', 'trial_requested', 'Trial Requested', 'checkbox', '', false, 6, NULL)
    `);

    // Insert field definitions for Retail
    await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${uuidv4()}', '${retailId}', 'store_type', 'Store Type', 'dropdown', 'Select type', true, 1, '${JSON.stringify(
        [
          { label: 'Physical Store', value: 'physical' },
          { label: 'Online Store', value: 'online' },
          { label: 'Both', value: 'both' },
        ],
      )}'),
      ('${uuidv4()}', '${retailId}', 'product_categories', 'Product Categories', 'multi_select', 'Select categories', false, 2, '${JSON.stringify(
        [
          { label: 'Fashion', value: 'fashion' },
          { label: 'Electronics', value: 'electronics' },
          { label: 'Home & Garden', value: 'home' },
          { label: 'Food & Grocery', value: 'food' },
          { label: 'Health & Beauty', value: 'health' },
          { label: 'Sports', value: 'sports' },
        ],
      )}'),
      ('${uuidv4()}', '${retailId}', 'store_count', 'Number of Stores', 'number', 'Enter count', false, 3, NULL),
      ('${uuidv4()}', '${retailId}', 'monthly_revenue', 'Monthly Revenue', 'currency', 'Enter revenue', false, 4, NULL),
      ('${uuidv4()}', '${retailId}', 'website_url', 'Website URL', 'url', 'Enter website', false, 5, NULL)
    `);

    // Insert field definitions for Consulting
    await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${uuidv4()}', '${consultingId}', 'consulting_area', 'Consulting Area', 'dropdown', 'Select area', true, 1, '${JSON.stringify(
        [
          { label: 'Strategy', value: 'strategy' },
          { label: 'Operations', value: 'operations' },
          { label: 'Finance', value: 'finance' },
          { label: 'HR', value: 'hr' },
          { label: 'Marketing', value: 'marketing' },
          { label: 'Technology', value: 'technology' },
        ],
      )}'),
      ('${uuidv4()}', '${consultingId}', 'company_size', 'Company Size', 'dropdown', 'Select size', false, 2, '${JSON.stringify(
        [
          { label: '1-10 employees', value: 'micro' },
          { label: '11-50 employees', value: 'small' },
          { label: '51-200 employees', value: 'medium' },
          { label: '201-500 employees', value: 'large' },
          { label: '500+ employees', value: 'enterprise' },
        ],
      )}'),
      ('${uuidv4()}', '${consultingId}', 'engagement_type', 'Engagement Type', 'dropdown', 'Select type', false, 3, '${JSON.stringify(
        [
          { label: 'One-time Project', value: 'project' },
          { label: 'Retainer', value: 'retainer' },
          { label: 'Advisory', value: 'advisory' },
        ],
      )}'),
      ('${uuidv4()}', '${consultingId}', 'timeline', 'Expected Timeline', 'text', 'Enter timeline', false, 4, NULL),
      ('${uuidv4()}', '${consultingId}', 'challenges', 'Current Challenges', 'textarea', 'Describe challenges', false, 5, NULL)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all seeded data
    await queryRunner.query(`DELETE FROM field_definitions`);
    await queryRunner.query(`DELETE FROM business_types`);
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedBusinessTypes1734850100000 = void 0;
const uuid_1 = require("uuid");
class SeedBusinessTypes1734850100000 {
    async up(queryRunner) {
        const manufacturingId = (0, uuid_1.v4)();
        const itServicesId = (0, uuid_1.v4)();
        const saasId = (0, uuid_1.v4)();
        const retailId = (0, uuid_1.v4)();
        const consultingId = (0, uuid_1.v4)();
        await queryRunner.query(`
      INSERT INTO business_types (id, name, description, icon, color, \`order\`) VALUES
      ('${manufacturingId}', 'Manufacturing', 'Manufacturing and production companies', 'pi-cog', '#F59E0B', 1),
      ('${itServicesId}', 'IT Services', 'IT consulting and software development', 'pi-desktop', '#3B82F6', 2),
      ('${saasId}', 'SaaS', 'Software as a Service companies', 'pi-cloud', '#8B5CF6', 3),
      ('${retailId}', 'Retail', 'Retail and e-commerce businesses', 'pi-shopping-cart', '#10B981', 4),
      ('${consultingId}', 'Consulting', 'Business and management consulting', 'pi-briefcase', '#EC4899', 5)
    `);
        await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${(0, uuid_1.v4)()}', '${manufacturingId}', 'product_category', 'Product Category', 'dropdown', 'Select category', true, 1, '${JSON.stringify([
            { label: 'Electronics', value: 'electronics' },
            { label: 'Machinery', value: 'machinery' },
            { label: 'Textiles', value: 'textiles' },
            { label: 'Chemicals', value: 'chemicals' },
            { label: 'Food & Beverage', value: 'food_beverage' },
            { label: 'Automotive', value: 'automotive' },
            { label: 'Other', value: 'other' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${manufacturingId}', 'quantity_required', 'Quantity Required', 'number', 'Enter quantity', true, 2, NULL),
      ('${(0, uuid_1.v4)()}', '${manufacturingId}', 'delivery_location', 'Delivery Location', 'text', 'Enter delivery address', false, 3, NULL),
      ('${(0, uuid_1.v4)()}', '${manufacturingId}', 'expected_delivery_date', 'Expected Delivery Date', 'date', '', false, 4, NULL),
      ('${(0, uuid_1.v4)()}', '${manufacturingId}', 'material_specifications', 'Material Specifications', 'textarea', 'Enter specifications', false, 5, NULL),
      ('${(0, uuid_1.v4)()}', '${manufacturingId}', 'budget_range', 'Budget Range', 'currency', 'Enter budget', false, 6, NULL)
    `);
        await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${(0, uuid_1.v4)()}', '${itServicesId}', 'service_type', 'Service Type', 'dropdown', 'Select service', true, 1, '${JSON.stringify([
            { label: 'Software Development', value: 'development' },
            { label: 'IT Support', value: 'support' },
            { label: 'Cloud Services', value: 'cloud' },
            { label: 'Cybersecurity', value: 'security' },
            { label: 'Data Analytics', value: 'analytics' },
            { label: 'Consulting', value: 'consulting' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${itServicesId}', 'technology_stack', 'Technology Stack', 'multi_select', 'Select technologies', false, 2, '${JSON.stringify([
            { label: 'React', value: 'react' },
            { label: 'Angular', value: 'angular' },
            { label: 'Node.js', value: 'nodejs' },
            { label: 'Python', value: 'python' },
            { label: 'Java', value: 'java' },
            { label: '.NET', value: 'dotnet' },
            { label: 'AWS', value: 'aws' },
            { label: 'Azure', value: 'azure' },
            { label: 'GCP', value: 'gcp' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${itServicesId}', 'project_duration', 'Project Duration (months)', 'number', 'Enter duration', false, 3, NULL),
      ('${(0, uuid_1.v4)()}', '${itServicesId}', 'team_size', 'Required Team Size', 'number', 'Enter team size', false, 4, NULL),
      ('${(0, uuid_1.v4)()}', '${itServicesId}', 'budget', 'Budget', 'currency', 'Enter budget', false, 5, NULL),
      ('${(0, uuid_1.v4)()}', '${itServicesId}', 'project_description', 'Project Description', 'textarea', 'Describe the project', false, 6, NULL)
    `);
        await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${(0, uuid_1.v4)()}', '${saasId}', 'plan_interest', 'Plan Interest', 'dropdown', 'Select plan', true, 1, '${JSON.stringify([
            { label: 'Basic', value: 'basic' },
            { label: 'Professional', value: 'pro' },
            { label: 'Enterprise', value: 'enterprise' },
            { label: 'Custom', value: 'custom' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${saasId}', 'number_of_users', 'Number of Users', 'number', 'Enter user count', true, 2, NULL),
      ('${(0, uuid_1.v4)()}', '${saasId}', 'integration_requirements', 'Integration Requirements', 'multi_select', 'Select integrations', false, 3, '${JSON.stringify([
            { label: 'Salesforce', value: 'salesforce' },
            { label: 'HubSpot', value: 'hubspot' },
            { label: 'Slack', value: 'slack' },
            { label: 'Microsoft Teams', value: 'teams' },
            { label: 'Zapier', value: 'zapier' },
            { label: 'API Access', value: 'api' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${saasId}', 'current_tools', 'Current Tools', 'textarea', 'List current tools', false, 4, NULL),
      ('${(0, uuid_1.v4)()}', '${saasId}', 'billing_cycle', 'Preferred Billing Cycle', 'dropdown', 'Select billing', false, 5, '${JSON.stringify([
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Annual', value: 'annual' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${saasId}', 'trial_requested', 'Trial Requested', 'checkbox', '', false, 6, NULL)
    `);
        await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${(0, uuid_1.v4)()}', '${retailId}', 'store_type', 'Store Type', 'dropdown', 'Select type', true, 1, '${JSON.stringify([
            { label: 'Physical Store', value: 'physical' },
            { label: 'Online Store', value: 'online' },
            { label: 'Both', value: 'both' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${retailId}', 'product_categories', 'Product Categories', 'multi_select', 'Select categories', false, 2, '${JSON.stringify([
            { label: 'Fashion', value: 'fashion' },
            { label: 'Electronics', value: 'electronics' },
            { label: 'Home & Garden', value: 'home' },
            { label: 'Food & Grocery', value: 'food' },
            { label: 'Health & Beauty', value: 'health' },
            { label: 'Sports', value: 'sports' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${retailId}', 'store_count', 'Number of Stores', 'number', 'Enter count', false, 3, NULL),
      ('${(0, uuid_1.v4)()}', '${retailId}', 'monthly_revenue', 'Monthly Revenue', 'currency', 'Enter revenue', false, 4, NULL),
      ('${(0, uuid_1.v4)()}', '${retailId}', 'website_url', 'Website URL', 'url', 'Enter website', false, 5, NULL)
    `);
        await queryRunner.query(`
      INSERT INTO field_definitions (id, business_type_id, name, label, field_type, placeholder, is_required, \`order\`, options) VALUES
      ('${(0, uuid_1.v4)()}', '${consultingId}', 'consulting_area', 'Consulting Area', 'dropdown', 'Select area', true, 1, '${JSON.stringify([
            { label: 'Strategy', value: 'strategy' },
            { label: 'Operations', value: 'operations' },
            { label: 'Finance', value: 'finance' },
            { label: 'HR', value: 'hr' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Technology', value: 'technology' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${consultingId}', 'company_size', 'Company Size', 'dropdown', 'Select size', false, 2, '${JSON.stringify([
            { label: '1-10 employees', value: 'micro' },
            { label: '11-50 employees', value: 'small' },
            { label: '51-200 employees', value: 'medium' },
            { label: '201-500 employees', value: 'large' },
            { label: '500+ employees', value: 'enterprise' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${consultingId}', 'engagement_type', 'Engagement Type', 'dropdown', 'Select type', false, 3, '${JSON.stringify([
            { label: 'One-time Project', value: 'project' },
            { label: 'Retainer', value: 'retainer' },
            { label: 'Advisory', value: 'advisory' },
        ])}'),
      ('${(0, uuid_1.v4)()}', '${consultingId}', 'timeline', 'Expected Timeline', 'text', 'Enter timeline', false, 4, NULL),
      ('${(0, uuid_1.v4)()}', '${consultingId}', 'challenges', 'Current Challenges', 'textarea', 'Describe challenges', false, 5, NULL)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM field_definitions`);
        await queryRunner.query(`DELETE FROM business_types`);
    }
}
exports.SeedBusinessTypes1734850100000 = SeedBusinessTypes1734850100000;
//# sourceMappingURL=1734850100000-SeedBusinessTypes.js.map
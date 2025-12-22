"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const entities_1 = require("./entities");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'whatsapp_lead_management',
    entities: [
        entities_1.User,
        entities_1.Category,
        entities_1.CategoryMedia,
        entities_1.AutoReplyTemplate,
        entities_1.Lead,
        entities_1.LeadContact,
        entities_1.LeadStatusMaster,
        entities_1.Message,
        entities_1.LeadHistory,
        entities_1.SlaPolicy,
        entities_1.SlaTracking,
        entities_1.NotificationConfig,
        entities_1.NotificationLog,
        entities_1.UserCategory,
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
});
//# sourceMappingURL=data-source.js.map
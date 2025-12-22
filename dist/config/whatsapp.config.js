"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('whatsapp', () => ({
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    version: process.env.CLOUD_API_VERSION,
}));
//# sourceMappingURL=whatsapp.config.js.map
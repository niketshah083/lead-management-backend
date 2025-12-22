"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappConfig = exports.awsConfig = exports.jwtConfig = exports.databaseConfig = void 0;
var database_config_1 = require("./database.config");
Object.defineProperty(exports, "databaseConfig", { enumerable: true, get: function () { return database_config_1.default; } });
var jwt_config_1 = require("./jwt.config");
Object.defineProperty(exports, "jwtConfig", { enumerable: true, get: function () { return jwt_config_1.default; } });
var aws_config_1 = require("./aws.config");
Object.defineProperty(exports, "awsConfig", { enumerable: true, get: function () { return aws_config_1.default; } });
var whatsapp_config_1 = require("./whatsapp.config");
Object.defineProperty(exports, "whatsappConfig", { enumerable: true, get: function () { return whatsapp_config_1.default; } });
//# sourceMappingURL=index.js.map
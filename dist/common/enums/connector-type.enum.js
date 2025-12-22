"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.ConnectorStatus = exports.ConnectorType = void 0;
var ConnectorType;
(function (ConnectorType) {
    ConnectorType["WEBHOOK"] = "webhook";
    ConnectorType["META"] = "meta";
    ConnectorType["GOOGLE"] = "google";
    ConnectorType["YOUTUBE"] = "youtube";
    ConnectorType["LINKEDIN"] = "linkedin";
    ConnectorType["WHATSAPP"] = "whatsapp";
    ConnectorType["INDIAMART"] = "indiamart";
    ConnectorType["TRADEINDIA"] = "tradeindia";
})(ConnectorType || (exports.ConnectorType = ConnectorType = {}));
var ConnectorStatus;
(function (ConnectorStatus) {
    ConnectorStatus["CONNECTED"] = "connected";
    ConnectorStatus["DISCONNECTED"] = "disconnected";
    ConnectorStatus["ERROR"] = "error";
    ConnectorStatus["PENDING"] = "pending";
})(ConnectorStatus || (exports.ConnectorStatus = ConnectorStatus = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["IDLE"] = "idle";
    SyncStatus["SYNCING"] = "syncing";
    SyncStatus["SUCCESS"] = "success";
    SyncStatus["FAILED"] = "failed";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=connector-type.enum.js.map
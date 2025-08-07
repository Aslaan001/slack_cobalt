"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ScheduledMessageSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    channelId: { type: String, required: true },
    channelName: { type: String, required: true },
    message: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    failed: { type: Boolean, default: false },
    failedAt: { type: Date },
    failureReason: { type: String },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});
// Create compound index for scheduler queries (most important for performance)
ScheduledMessageSchema.index({
    scheduledFor: 1,
    sent: 1,
    status: 1
});
// Index for user-specific queries
ScheduledMessageSchema.index({ userId: 1, sent: 1 });
// Index for status-based queries
ScheduledMessageSchema.index({ status: 1, scheduledFor: 1 });
// Index for failed messages
ScheduledMessageSchema.index({ failed: 1, failedAt: 1 });
// Text index for message search (if needed)
ScheduledMessageSchema.index({ message: 'text' });
exports.default = mongoose_1.default.model('ScheduledMessage', ScheduledMessageSchema);
//# sourceMappingURL=ScheduledMessage.js.map
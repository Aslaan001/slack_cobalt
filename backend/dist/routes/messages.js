"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.get('/channels/:userId', messageController_1.messageController.getChannels);
router.post('/send/:userId', messageController_1.messageController.sendMessage);
router.post('/schedule/:userId', messageController_1.messageController.scheduleMessage);
router.get('/scheduled/:userId', messageController_1.messageController.getScheduledMessages);
router.delete('/scheduled/:messageId', messageController_1.messageController.cancelScheduledMessage);
exports.default = router;
//# sourceMappingURL=messages.js.map
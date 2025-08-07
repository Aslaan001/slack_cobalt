"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.get('/initiate', authController_1.authController.initiateAuth);
router.get('/callback', authController_1.authController.handleCallback);
router.delete('/logout/:userId', authController_1.authController.logout);
router.post('/exchange-tokens/:userId', authController_1.authController.exchangeTokens);
exports.default = router;
//# sourceMappingURL=auth.js.map
const express = require('express');
const router = express.Router();
const authController = require('./auth.controllers');

router.get("/login", authController.renderLogin);
router.post("/login", authController.login);

router.get("/register", authController.renderRegister);
router.post("/register", authController.register);

router.get("/forgot-password", authController.renderForgotPassword);
router.post("/forgot-password", authController.forgotPassword);

router.get("/reset-password", authController.renderResetPassword);
router.post("/reset-password", authController.resetPassword);

router.get("/verify", authController.verifyEmail);
router.post("/check-availability", authController.checkAvailability);

router.get("/logout", authController.logout);

module.exports = router;

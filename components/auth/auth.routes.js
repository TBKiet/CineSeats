const express = require('express');
const router = express.Router();
const authController = require('./auth.controllers');

// Login route
router.get("/login", authController.renderLogin);
router.post('/login', authController.login);

// Forgot password route
router.get("/forgot-password", authController.renderForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
// Reset password route
router.get("/reset-password", authController.renderResetPassword);
router.post('/reset-password', authController.resetPassword);
// Register route
router.get("/register", authController.renderRegister);
router.post('/register', authController.register);

//Logout route
router.get("/logout", authController.logout);

// Route to check availability of username and email
router.post("/check-availability", authController.checkAvailability);

// route to verify email
router.get("/verify", authController.verifyEmail);

module.exports = router;

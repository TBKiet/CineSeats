const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");

// Routes for rendering pages
router.post("/create_payment_url", paymentController.createPaymentUrl);
router.get("/vnpay_return", paymentController.vnpayReturn);
router.get("/vnpay_ipn", paymentController.vnpayIPN);
module.exports = router;
const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const zaloPayController = require("./zaloPay.controller");

// Routes for creating payment URLs
router.post("/create_payment_url", paymentController.createPaymentUrl);

// Routes for handling VNPAY responses and notifications
router.get("/vnpay_return", paymentController.vnpayReturn);
router.get("/vnpay_ipn", paymentController.vnpayIPN);

// Routes for handling ZaloPay responses and notifications
router.get("/zalopay_return", zaloPayController.zaloPayReturn);
router.post("/zalopay_ipn", zaloPayController.zaloPayIPN);

module.exports = router;
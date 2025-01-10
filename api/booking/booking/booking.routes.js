const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");

router.get("/", bookingController.getSeatsJson);
router.post("/validate", bookingController.validateSeats);
module.exports = router;
const express = require("express");
const router = express.Router();
const {
    renderGeneral,
    updateAccountInfo,
    renderChangePassword,
    updatePassword,
    getInfo,
    renderBookingHistory,
    getBookingHistory
} = require("./account.controllers");
const {uploadAvatar} = require("../cloudinary/config/cloud");

// Routes for rendering pages
router.get("/info", getInfo);
router.get("/general", renderGeneral);
router.get("/change-password", renderChangePassword);
router.post("/change-password", updatePassword);
router.get("/booking-history", renderBookingHistory);
router.get("/booking", getBookingHistory);

router.post("/update", uploadAvatar.single('avatar_url'), updateAccountInfo);

module.exports = router;
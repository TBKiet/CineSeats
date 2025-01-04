const express = require("express");
const router = express.Router();
const { renderGeneral, updateAccountInfo, renderChangePassword, updatePassword, getInfo } = require("./account.controllers");
const {uploadAvatar} = require("../cloudinary/config/cloud");

// Routes for rendering pages
router.get("/info", getInfo);
router.get("/general", renderGeneral);
router.get("/change-password", renderChangePassword);
router.post("/change-password", updatePassword);
// router.get("/booking-history", renderBookingHistory);
router.post("/update", uploadAvatar.single('avatar_url'), updateAccountInfo);
// router.get("/history", getBookingHistory);

module.exports = router;
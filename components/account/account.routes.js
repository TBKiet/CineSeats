const express = require("express");
const router = express.Router();
const { renderGeneral, renderSetting, renderHistory, getAccountInfo, updateAccountInfo } = require("./account.controllers");
const { upload } = require('../cloudinary/config/cloud');

// Routes for rendering pages
router.get("/general", renderGeneral);
//router.get("/membership", renderMembership);
//router.get("/voucher", renderVoucher);
router.get("/setting", renderSetting);
router.get("/history", renderHistory);

router.get("/info", getAccountInfo);
router.post("/update", upload.single('movieImage'), updateAccountInfo);

module.exports = router;

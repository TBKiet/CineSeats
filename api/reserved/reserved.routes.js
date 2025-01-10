const express = require('express');
const router = express.Router();
const reservedController = require('./reserved.controller');

router.get('/', reservedController.getReserved);
router.post('/', reservedController.createReserved);
router.post('/cancel', reservedController.cancelReserved);
module.exports = router;
const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');

router.get('/total-users', dashboardController.getTotalUsers);
router.get('/total-movies', dashboardController.getTotalMovies);
router.get('/total-tickets', dashboardController.getTotalTickets);
router.get('/total-revenue', dashboardController.getTotalRevenue);
router.get('/revenue-report', dashboardController.getRevenueReport);
module.exports = router;
const dashboardService = require('./dashboard.service');

exports.getTotalUsers = async (req, res, next) => {
    try {
        const totalUsers = await dashboardService.fetchTotalUsers();
        res.json({ totalUsers });
    } catch (error) {
        next(error);
    }
};

exports.getTotalMovies = async (req, res, next) => {
    try {
        const totalMovies = await dashboardService.fetchTotalMovies();
        res.json({ totalMovies });
    } catch (error) {
        next(error);
    }
};

exports.getTotalTickets = async (req, res, next) => {
    try {
        const totalTickets = await dashboardService.fetchTotalTickets();
        res.json({ totalTickets });
    } catch (error) {
        next(error);
    }
};

exports.getTotalRevenue = async (req, res, next) => {
    try {
        // sum of all totalAmount in bookings if the status is Paid
        const totalRevenue = await dashboardService.fetchTotalRevenue();
        res.json({ totalRevenue });
    }
    catch (error) {
        next(error);
    }
};
const {getSeatAvailability } = require('./booking.service');

exports.getSeatsJson = async (req, res, next) => {
    const showtimeId = req.query.showtimeId;
    if (!showtimeId) {
        return res.status(400).json({ success: false, message: 'showtimeId is required' });
    }
    try {
        const seatsData = await getSeatAvailability(showtimeId);
        res.json({ success: true, rows: seatsData });
    } catch (error) {
        next(error); // Forward to centralized error handler
    }
};

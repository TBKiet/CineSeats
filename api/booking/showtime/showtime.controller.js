const { getShowtimes } = require('./showtime.service');

exports.getShowtimesJson = async (req, res, next) => {
    const { movieId, date, City } = req.query;
    if (!movieId) {
        return res.status(400).json({ success: false, message: 'movieId is required' });
    }
    try {
        const newDate = date ? new Date(date) : new Date();
        const showtimeData = await getShowtimes(movieId, newDate, City);
        res.json({ success: true, data: showtimeData });
    } catch (error) {
        next(error); // Forward to centralized error handler
    }
};

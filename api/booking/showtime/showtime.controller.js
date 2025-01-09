const { getShowtimes, getShowtimeById } = require('./showtime.service');

exports.getShowtimesJson = async (req, res, next) => {
    const { movieId, date, City, theater } = req.query;
    if (!movieId) {
        return res.status(400).json({ success: false, message: 'movieId is required' });
    }
    try {
        const newDate = date ? new Date(date) : new Date();
        const showtimeData = await getShowtimes(movieId, newDate, City, theater);
        res.json({ success: true, data: showtimeData });
    } catch (error) {
        next(error); // Forward to centralized error handler
    }
};

exports.getShowtimeByIdJson = async (req, res, next) => {
    const { showtimeId } = req.params;
    try {
        const showtimeData = await getShowtimeById(showtimeId);
        res.json({ success: true, data: showtimeData });
    } catch (error) {
        next(error); // Forward to centralized error handler
    }
}
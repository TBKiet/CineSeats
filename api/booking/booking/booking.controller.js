const { getSeatAvailability, validateSeatsService } = require('./booking.service');

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

exports.validateSeats = async (req, res, next) => {
    try {
        const { showtimeId, seatIds } = req.body;
        if (!showtimeId || !seatIds || seatIds.length === 0) {
            return res.status(400).send('showtimeId and seatIds are required.');
        }
        const isValid = await validateSeatsService(showtimeId, seatIds);
        if (isValid) {
            return res.json({
                success: true,
                message: 'All selected seats are available.',
                showtimeId,
                seatIds
            });
        } else {
            return res.json({
                success: false,
                message: 'One or more selected seats are already booked.',
                showtimeId,
                seatIds
            });
        }
    } catch (error) {
        console.error(`Error validating seats for showtimeID ${req.body.showtimeId}:`, error);
        res.status(500).send('Error validating seats.');
    }
};
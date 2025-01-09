// ...existing code...
const { getReservedService, createReservedService, cancelReservedService } = require('./reserved.service');

exports.getReserved = async (req, res) => {
    try {
        const { showtimeId } = req.query;
        if (!showtimeId) {
            return res.status(400).send('showtimeId is required.');
        }
        const reserved = await getReservedService(showtimeId);
        res.json(reserved);
    } catch (error) {
        console.error('Error getting reserved:', error);
        res.status(500).send('Error getting reserved.');
    }
};
exports.createReserved = async (req, res) => {
    try {
        const { showtimeId, seatIds } = req.body;
        if (!showtimeId || !seatIds) {
            return res.status(400).send('showtimeId and seatIds are required.');
        }
        const reserved = await createReservedService(showtimeId, seatIds);
        if (!reserved) {
            return res.status(409).send('Failed to reserve seats.');
        }
        res.json(reserved);
    } catch (error) {
        console.error('Error creating reserved:', error);
        res.status(500).send('Error creating reserved.');
    }
};

exports.cancelReserved = async (req, res) => {
    try {
        const { showtimeId, seatIds } = req.body;
        if (!showtimeId || !seatIds || seatIds.length === 0) {
            return res.status(400).send('showtimeId and seatIds are required.');
        }
        const canceled = await cancelReservedService({showtimeId, seatIds});
        if (!canceled || canceled.success === false) {
            return res.status(409).send('Failed to cancel seats.');
        }
        res.json(canceled);
    } catch (error) {
        console.error('Error canceling reserved:', error);
        res.status(500).send('Error canceling reserved.');
    }
};
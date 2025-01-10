const { redis } = require('../../config/redisConnection');
const RESERVED_SEAT_PREFIX = 'reserved_seat:';
const RESERVATION_TTL = 300; // 5 minutes

const getSeatKey = (showtimeId, seatId) => `${RESERVED_SEAT_PREFIX}${showtimeId}_${seatId}`;

async function getReservedService(showtimeId) {
    const pattern = `${RESERVED_SEAT_PREFIX}${showtimeId}_*`;
    let keys = [];

    try {
        // Initialize a stream for SCAN to avoid blocking Redis.
        const stream = redis.scanStream({
            match: pattern,
            count: 100 // Adjust the count as needed based on expected key volume.
        });

        // Collect all matching keys.
        for await (const resultKeys of stream) {
            keys = keys.concat(resultKeys);
        }

        // Extract seatIds from the keys.
        const seatIds = keys.map(key => key.substring(`${RESERVED_SEAT_PREFIX}${showtimeId}_`.length));

        return {
            success: true,
            showtimeId,
            seatIds
        };
    } catch (error) {
        console.error('Error retrieving reserved seats:', error);
        throw new Error('Failed to retrieve reserved seats.');
    }
}

async function createReservedService(showtimeId, seatIds) {
    const multi = redis.multi();  // Using multi to group multiple commands
    const reservedSeats = [];

    // Prepare all the reservation commands
    for (let seatId of seatIds) {
        const key = getSeatKey(showtimeId, seatId);
        // Use SETNX to only set the key if it does not exist (to prevent double booking)
        multi.set(key, '1', 'NX', 'EX', RESERVATION_TTL);
        reservedSeats.push(key);  // Collect Redis keys for seats that are being reserved
    }

    try {
        // Execute the multi transaction
        const results = await multi.exec();

        // Check if any reservation failed
        const successfullyReservedSeats = [];
        const failedReservations = [];
        results.forEach(([err, reply], index) => {
            if (err || reply !== 'OK') {
                failedReservations.push(seatIds[index]);
            } else {
                successfullyReservedSeats.push(seatIds[index]);
            }
        });

        if (failedReservations.length > 0) {
            // If any reservation failed, cancel all previous reservations to maintain consistency
            if (successfullyReservedSeats.length > 0) {
                await cancelReservedService({ seatKeys: successfullyReservedSeats });
            }
            console.log('Failed to reserve seats:', failedReservations);
            return {
                success: false,
                message: `Failed to reserve seats: ${failedReservations.join(', ')}.`,
                failedSeats: failedReservations
            };
        }

        // Return the successfully reserved seats
        return {
            success: true,
            message: `Successfully reserved ${seatIds.length} seat(s) for showtime ${showtimeId}.`,
            showtimeId,
            seatIds,
            ttl: RESERVATION_TTL
        };
    } catch (error) {
        console.error('Error during seat reservation:', error);
        await cancelReservedService({ seatKeys: reservedSeats });
        throw new Error('Failed to reserve seats');
    }
}

async function cancelReservedService({ seatKeys, showtimeId, seatIds }) {
    console.log('Cancelling reservation:', seatKeys, showtimeId, seatIds);
    const multi = redis.multi();
    let keysToDelete;

    if (seatKeys && seatKeys.length > 0) {
        // If direct keys are provided
        keysToDelete = seatKeys;
    } else if (showtimeId && seatIds && seatIds.length > 0) {
        // If showtimeId and seatIds are provided
        keysToDelete = seatIds.map(seatId => getSeatKey(showtimeId, seatId));
    } else {
        // No valid input, handle as needed
        return { success: false, message: 'Invalid cancel reservation input.' };
    }
    keysToDelete.forEach(key => multi.del(key));
    const results = await multi.exec();

    // Check for errors
    for (const [err] of results) {
        if (err) {
            console.error('Error deleting seat:', err);
            return { success: false, message: 'Error canceling seats.' };
        }
    }

    return {
        success: true,
        message: `Successfully canceled ${keysToDelete.length} seat(s).`,
        showtimeId,
        seatIds
    };
}

module.exports = { getReservedService, createReservedService, cancelReservedService };
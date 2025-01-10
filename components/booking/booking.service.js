function extractAvailableSeats(availableSeatsData, reservedSeatsData) {
    // Convert reservedSeatIds array to a Set for efficient lookups
    const reservedSeatIdsSet = new Set(reservedSeatsData.seatIds);
    if (reservedSeatIdsSet.size === 0) {
        return availableSeatsData;
    }
    // Iterate over each row and seat to mark reserved seats
    availableSeatsData.rows.forEach(row => {
        row.seats.forEach(seat => {
            if (reservedSeatIdsSet.has(seat.seatID)) {
                seat.status = 'unavailable';
            }
        });
    });

    return availableSeatsData; // Return the updated data structure
}

module.exports = { extractAvailableSeats };
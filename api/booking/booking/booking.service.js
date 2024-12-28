const { Seat, TheaterRoom, Showtime, Ticket } = require('../booking_model');

async function getSeatAvailability(showtimeId) {
    try {
        const seats = await Seat.findAll({
            attributes: ['seatID', 'rowLetter', 'seatNumber','seatVisibility'],
            include: [
                {
                    model: TheaterRoom,
                    required: true,
                    attributes: [],
                    include: [
                        {
                            model: Showtime,
                            required: true,
                            where: { showtimeID: showtimeId },
                            attributes: []
                        }
                    ],
                },
                {
                    model: Ticket,
                    required: false,
                    where: {
                        showtimeID: showtimeId,
                        status: 'Booked'
                    },
                    attributes: ['ticketID']
                }
            ],
            raw: true,
        });
        const rows = {};

        seats.forEach(seat => {
            if (!rows[seat.rowLetter]) {
                rows[seat.rowLetter] = { rowLetter: seat.rowLetter, seats: [] };
            }
            seat.status = seat['Tickets.ticketID'] ? 'unavailable' : 'available';
            rows[seat.rowLetter].seats.push(seat);
        });

        const formattedRows = Object.values(rows);
        return formattedRows;
    } catch (error) {
        console.error(`Error fetching seat availability for showtimeID ${showtimeId}:`, error);
        throw new Error(`Failed to retrieve seat availability for showtimeID ${showtimeId}.`);
    }
}

module.exports = { getSeatAvailability };
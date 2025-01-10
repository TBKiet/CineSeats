const { Seat, TheaterRoom, Showtime, Ticket, SeatType } = require('../booking_model');

async function getSeatAvailability(showtimeId) {
    try {
        const seats = await Seat.findAll({
            attributes: ['seatID', 'rowLetter', 'seatNumber', 'seatVisibility'],
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
                },
                {
                    model: SeatType, // Added SeatType join
                    required: true,
                    attributes: ['seatType', 'price']
                }
            ],
            raw: true,
            order: [['seatID', 'ASC']]
        });
        const rows = {};
        seats.forEach(seat => {
            if (!rows[seat.rowLetter]) {
                rows[seat.rowLetter] = { rowLetter: seat.rowLetter, seats: [] };
            }
            seat.status = seat.Tickets ? 'unavailable' : 'available';
            seat.price = seat['SeatType.price']; // Added price
            seat.seatType = seat['SeatType.seatType']; // Added seatType
            delete seat.SeatType;
            delete seat['SeatType.seatType'];
            delete seat['SeatType.price'];
            rows[seat.rowLetter].seats.push(seat);
        });

        const formattedRows = Object.values(rows);
        return formattedRows;
    } catch (error) {
        console.error(`Error fetching seat availability for showtimeID ${showtimeId}:`, error);
        throw new Error(`Failed to retrieve seat availability for showtimeID ${showtimeId}.`);
    }
}
async function validateSeatsService(showtimeId, seatIds) {
    try {
        const existingTickets = await Ticket.findAll({
            where: {
                showtimeID: showtimeId,
                seatID: seatIds,
                status: 'Booked'
            }
        });
        return existingTickets.length === 0;
    } catch (error) {
        console.error(`Error validating seats for showtimeID ${showtimeId}:`, error);
        throw new Error(`Failed to validate seats for showtimeID ${showtimeId}.`);
    }
}
module.exports = { getSeatAvailability, validateSeatsService };
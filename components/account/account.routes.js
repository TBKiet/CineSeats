const express = require("express");
const {Booking, Ticket, Showtime, Movie, Seat, Theater, TheaterRoom} = require('../../api/booking/booking_model');
const router = express.Router();

const {
    renderGeneral,
    updateAccountInfo,
    renderChangePassword,
    updatePassword,
    getInfo,
    renderBookingHistory,
    getBookingHistory
} = require("./account.controllers");
const {uploadAvatar} = require("../cloudinary/config/cloud");

// Routes for rendering pages
router.get("/info", getInfo);
router.get("/general", renderGeneral);
router.get("/change-password", renderChangePassword);
router.post("/change-password", updatePassword);
router.get("/booking-history", renderBookingHistory);
router.get("/booking", getBookingHistory);
router.get('/booking/:bookingId/details', async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const bookingDetails = await Booking.findOne({
            where: {bookingID: bookingId},
            include: [
                {
                    model: Ticket,
                    include: [
                        {
                            model: Showtime,
                            include: [
                                {model: Movie},
                                {model: TheaterRoom, include: [Theater]}
                            ]
                        },
                        {model: Seat}
                    ]
                }
            ]
        });

        if (!bookingDetails) {
            return res.status(404).json({message: 'Booking not found'});
        }

        const details = {
            title: bookingDetails.Tickets[0].Showtime.Movie.title,
            seats: bookingDetails.Tickets.map(ticket => ({
                rowLetter: ticket.Seat.rowLetter,
                seatNumber: ticket.Seat.seatNumber
            })),
            startTime: bookingDetails.Tickets[0].Showtime.startTime,
            theaterName: bookingDetails.Tickets[0].Showtime.TheaterRoom.Theater.theaterName,
            roomName: bookingDetails.Tickets[0].Showtime.TheaterRoom.roomName
        };

        res.json(details);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post("/update", uploadAvatar.single('avatar_url'), updateAccountInfo);

module.exports = router;
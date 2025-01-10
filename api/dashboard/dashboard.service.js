const { Booking, Ticket, Movie, User, sequelize } = require('../booking/booking_model/index');

exports.fetchTotalUsers = async () => {
    return await User.count('email', {distinct: true});
};

exports.fetchTotalMovies = async () => {
    return await Movie.count('movieId', {distinct: true});
};

exports.fetchTotalTickets = async () => {
    // count bookingID where paymentStatus is Paid
    return await Ticket.count( {where: {status: 'Booked'}});
};

exports.fetchTotalRevenue = async () => {
    return await Booking.sum('totalAmount', {where: {paymentStatus: 'Paid'}});
};
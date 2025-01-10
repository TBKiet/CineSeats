const { Booking, Ticket, Movie, User, sequelize } = require('../booking/booking_model/index');

exports.fetchTotalUsers = async () => {
    return await User.count('email', {distinct: true});
};

exports.fetchTotalMovies = async () => {
    return await Movie.count('movieId', {distinct: true});
};

exports.fetchTotalTickets = async () => {
    return await Ticket.count();
};

exports.fetchTotalRevenue = async () => {
    return await Booking.sum('totalAmount', {where: {paymentStatus: 'Paid'}});
};
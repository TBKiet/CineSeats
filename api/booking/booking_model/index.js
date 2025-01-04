// Import Models
const User = require('./User');
const Movie = require('./Movie');
const Theater = require('./Theater');
const TheaterRoom = require('./TheaterRoom');
const Seat = require('./Seats');
const Showtime = require('./Showtime');
const Booking = require('./Booking');
const Ticket = require('./Tickets');
const { Sequelize } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');
// Define Associations

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'username' });
Booking.belongsTo(User, { foreignKey: 'username' });

// Movie <-> Showtime
Movie.hasMany(Showtime, { foreignKey: 'movieId' });
Showtime.belongsTo(Movie, { foreignKey: 'movieId' });

// Theater <-> TheaterRoom
Theater.hasMany(TheaterRoom, { foreignKey: 'theaterId' });
TheaterRoom.belongsTo(Theater, { foreignKey: 'theaterId' });

// TheaterRoom <-> Seat
TheaterRoom.hasMany(Seat, { foreignKey: 'roomId' });
Seat.belongsTo(TheaterRoom, { foreignKey: 'roomId' });

// TheaterRoom <-> Showtime
TheaterRoom.hasMany(Showtime, { foreignKey: 'theaterRoomId' });
Showtime.belongsTo(TheaterRoom, { foreignKey: 'theaterRoomId' });

// Showtime <-> Ticket
Showtime.hasMany(Ticket, { foreignKey: 'showtimeId' });
Ticket.belongsTo(Showtime, { foreignKey: 'showtimeId' });

// Booking <-> Ticket
Booking.hasMany(Ticket, { foreignKey: 'bookingId' });
Ticket.belongsTo(Booking, { foreignKey: 'bookingId' });

// Seat <-> Ticket
Seat.hasMany(Ticket, { foreignKey: 'seatId' });
Ticket.belongsTo(Seat, { foreignKey: 'seatId' });

module.exports = {
    User,
    Movie,
    Theater,
    TheaterRoom,
    Seat,
    Showtime,
    Booking,
    Ticket,
    Sequelize,
    sequelize
};
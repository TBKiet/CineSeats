const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');
const Booking = require('./Booking');
const Showtime = require('./Showtime');
const Seat = require('./Seats');

const Ticket = sequelize.define('Ticket', {
    ticketID: {
        field: 'TicketID',
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    bookingId: {
        field: 'BookingID',
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Booking,
            key: 'bookingID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    showtimeId: {
        field: 'ShowtimeID',
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Showtime,
            key: 'showtimeID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    seatId: {
        field: 'SeatID',
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Seat,
            key: 'seatID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    price: {
        field: 'Price',
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    status: {
        field: 'Status',
        type: DataTypes.ENUM('Booked', 'Canceled'),
        allowNull: false,
        defaultValue: 'Booked',
        validate: {
            isIn: [['Booked', 'Canceled']]
        }
    }
}, {
    tableName: 'Tickets',
    timestamps: false
});


module.exports = Ticket;
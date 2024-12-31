const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');
const TheaterRoom = require('./TheaterRoom');

const Seat = sequelize.define('Seat', {
    seatID: {
        field: 'SeatID',
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    roomId: {
        field: 'RoomID',
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: TheaterRoom,
            key: 'roomID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    rowLetter: {
        field: 'RowLetter',
        type: DataTypes.CHAR(1),
        allowNull: false,
        validate: {
            is: /^[A-J]$/i
        }
    },
    seatNumber: {
        field: 'SeatNumber',
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    seatVisibility: {
        field: 'Visibility',
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    Status: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.Tickets && this.Tickets.ticketID ? 'Unavailable' : 'Available';
        }
    }
}, {
    tableName: 'Seats',
    timestamps: false
});


module.exports = Seat;
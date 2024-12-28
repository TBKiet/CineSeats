const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');
const Theater = require('./Theater');

const TheaterRoom = sequelize.define('TheaterRoom', {
    roomID: {
        field: 'RoomID',
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    theaterId: {
        field: 'TheaterID',
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Theater,
            key: 'theaterID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    roomName: {
        field: 'RoomName',
        type: DataTypes.STRING(50),
        allowNull: true
    },
    totalSeats: {
        field: 'TotalSeats',
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    }
}, {
    tableName: 'TheaterRooms',
    timestamps: false
});


module.exports = TheaterRoom;
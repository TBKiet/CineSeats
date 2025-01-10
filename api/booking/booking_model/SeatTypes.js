const {DataTypes}  = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');

const SeatType = sequelize.define('SeatType', {
    seatType: {
        type: DataTypes.ENUM('Normal', 'VIP'),
        primaryKey: true,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'SeatTypes',
    timestamps: false,
});

module.exports = SeatType;
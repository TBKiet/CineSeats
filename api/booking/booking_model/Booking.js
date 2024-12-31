const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');
const User = require('./User');

const Booking = sequelize.define('Booking', {
    bookingID: {
        field: 'BookingID',
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    userId: {
        field: 'UserID',
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: User,
            key: 'userID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    totalAmount: {
        field: 'TotalAmount',
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    paymentStatus: {
        field: 'PaymentStatus',
        type: DataTypes.ENUM('Paid', 'Pending', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending',
        validate: {
            isIn: [['Paid', 'Pending', 'Failed']]
        }
    },
    paymentMethod: {
        field: 'PaymentMethod',
        type: DataTypes.ENUM('VNPAY', 'MoMo'),
        allowNull: false,
        defaultValue: 'VNPAY',
        validate: {
            isIn: [['VNPAY', 'MoMo']]
        }
    },
    bookingDateTime: {
        field: 'BookingDateTime',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Bookings',
    timestamps: false
});

module.exports = Booking;
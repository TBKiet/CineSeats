const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');

const User = sequelize.define('User', {
    userID: {
        field: 'UserID',
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    name: {
        field: 'Name',
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        field: 'Email',
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        field: 'PasswordHash',
        type: DataTypes.STRING(255),
        allowNull: false
    },
    createdAt: {
        field: 'CreatedAt',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Users',
    timestamps: false
});


module.exports = User;
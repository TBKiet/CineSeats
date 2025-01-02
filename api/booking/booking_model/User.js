const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/cineseatsDBConnection');

const User = sequelize.define('User', {
    userID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'employee'),
        defaultValue: 'user',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    activationToken: {
        type: DataTypes.STRING(255),
    },
    activationExpires: {
        type: DataTypes.DATE,
    },
    accumulated_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    phone: {
        type: DataTypes.STRING(15),
    },
    avatar_url: {
        type: DataTypes.TEXT,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Users', // Tên bảng trong cơ sở dữ liệu
    timestamps: true,  // Sử dụng `createdAt` và `updatedAt`
});

module.exports = User;
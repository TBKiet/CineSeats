const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        logging: false, // Disable logging
    }
);

// Test the connection
sequelize
    .authenticate()
    .then(() => {
        console.log('Connected to MySQL database.');
    })
    .catch((err) => {
        console.error('Unable to connect to MySQL database:', err);
    });

module.exports = sequelize;

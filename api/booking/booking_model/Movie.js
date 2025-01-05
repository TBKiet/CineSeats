const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/cineseatsDBConnection");

const Movie = sequelize.define(
  "Movie",
  {
    movieID: {
      field: "MovieID",
      type: DataTypes.STRING(40),
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    title: {
      field: "Title",
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "Movies",
    timestamps: false,
  }
);

module.exports = Movie;

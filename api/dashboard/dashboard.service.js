const {
  Booking,
  Ticket,
  Movie,
  User,
  sequelize
} = require("../booking/booking_model/index");
const { Op } = require("sequelize");

exports.fetchTotalUsers = async () => {
  return await User.count("email", { distinct: true });
};

exports.fetchTotalMovies = async () => {
  return await Movie.count("movieId", { distinct: true });
};

exports.fetchTotalTickets = async () => {
  // count bookingID where paymentStatus is Paid
  return await Ticket.count({ where: { status: "Booked" } });
};

exports.fetchTotalRevenue = async () => {
  return await Booking.sum("totalAmount", { where: { paymentStatus: "Paid" } });
};

exports.fetchRevenueReport = async (timeRange) => {
  // Query bookings based on timeRange
  const where = { paymentStatus: "Paid" };

  if (timeRange) {
    // Add date filtering based on timeRange
    const today = new Date();
    where.createdAt = {
      [Op.gte]:
          timeRange === "week"
              ? new Date(today - 7 * 24 * 60 * 60 * 1000)
              : new Date(today - 30 * 24 * 60 * 60 * 1000),
    };
  }

  return await Booking.findAll({
    where,
    attributes: [
      [sequelize.fn("date", sequelize.col("createdAt")), "date"],
      [sequelize.fn("sum", sequelize.col("totalAmount")), "revenue"],
    ],
    group: [sequelize.fn("date", sequelize.col("createdAt"))],
    order: [[sequelize.fn("date", sequelize.col("createdAt")), "ASC"]],
  });
};
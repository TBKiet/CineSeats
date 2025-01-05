const { User } = require("../../api/booking/booking_model");

const getTotalUsers = async () => {
  try {
    return await User.count();
  } catch (error) {
    console.error("Error getting total users:", error);
    return null;
  }
};

module.exports = { getTotalUsers };

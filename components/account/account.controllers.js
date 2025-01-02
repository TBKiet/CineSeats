const User = require('../../api/booking/booking_model/User');
const {cloudinary} = require('../cloudinary/config/cloud');

const renderGeneral = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            try {
                const user = await User.findOne({where: {userID: req.user.userID}});
                res.render('account/general', {
                    user: {
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        avatar_url: user.avatar_url,
                        accumulated_points: user.accumulated_points,
                        accumulated_points_percentage: user.accumulated_points / 4000000.0 * 100,
                    },
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Error loading dashboard.");
    }
}
module.exports = {renderGeneral};
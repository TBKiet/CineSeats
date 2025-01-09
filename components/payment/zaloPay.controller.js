const axios = require('axios');
const CryptoJS = require('crypto-js')
const crypto = require('crypto');
const moment = require('moment');
const {Booking, Ticket, sequelize} = require('../../api/booking/booking_model'); // Adjust the path if necessary
const {v4: uuidv4} = require('uuid');
const {stringify} = require("node:querystring");
require('dotenv').config();
const generateBookingID = () => {
    return 'B' + uuidv4().replace(/-/g, '').slice(0, 9);
};
const {sortObject} = require('./payment.service');
const generateTicketID = () => {
    return 'TK' + uuidv4().replace(/-/g, '').slice(0, 8);
};

exports.createPaymentUrl = async function (req, res, next) {
    try {
        await sequelize.transaction(async (t) => {
            const {totalAmount, paymentMethod, selectedSeats, showtimeId} = req.body;
            const username = req.user.username;
            if (!username || !totalAmount || !paymentMethod || !selectedSeats || !showtimeId) {
                throw new Error('Missing required payment details.');
            }

            // Parse selectedSeats if it's a string
            let parsedSeats;
            if (typeof selectedSeats === 'string') {
                parsedSeats = JSON.parse(selectedSeats);
            } else {
                parsedSeats = selectedSeats;
            }

            // Ensure parsedSeats is an array
            if (!Array.isArray(parsedSeats)) {
                throw new Error('selectedSeats must be an array.');
            } else console.log('parsedSeats:', parsedSeats);


            // Create a new booking record
            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');
            const bookingId = generateBookingID();
            console.log(`Generated Booking ID: ${bookingId}`);

            const booking = await Booking.create(
                {
                    bookingID: bookingId,
                    username: username,
                    totalAmount: totalAmount,
                    paymentStatus: "Pending",
                    paymentMethod: paymentMethod,
                    bookingDateTime: date,
                },
                {transaction: t}
            );

            const ticketPromises = parsedSeats.map(async (seat) => {
                const ticketId = generateTicketID();
                const price = 50;
                return Ticket.create(
                    {
                        ticketID: ticketId,
                        bookingId: bookingId,
                        showtimeId: showtimeId,
                        seatId: seat,
                        price: price,
                        status: 'Booked',
                    },
                    {transaction: t}
                );
            });

            await Promise.all(ticketPromises);

            if (paymentMethod === "VNPAY") {
                // Generate VNPAY Payment URL
                let vnpUrl = await generateVnpayUrl({totalAmount, bookingId, createDate, req});
                res.redirect(vnpUrl);
            } else if (paymentMethod === "ZALOPAY") {
                // Generate ZaloPay Payment URL
                let zaloPayUrl = await generateZaloPayUrl({totalAmount, bookingId, createDate, req});
                res.redirect(zaloPayUrl);
            } else {
                throw new Error("Invalid payment method");
            }
        });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        res.status(500).json({message: 'Internal Server Error.'});
    }
};

async function generateVnpayUrl({totalAmount, bookingId, createDate, req}) {
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let tmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    let returnUrl = process.env.vnp_ReturnUrl;

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: bookingId,
        vnp_OrderInfo: `Thanh toan cho ma GD:${bookingId}`,
        vnp_OrderType: 'other',
        vnp_Amount: totalAmount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);
    let signData = stringify(vnp_Params, {encode: false});
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    return vnpUrl + '?' + querystring.stringify(vnp_Params, {encode: false});
}

async function generateZaloPayUrl({totalAmount, bookingId, createDate, req}) {
    let appid = process.env.zlp_AppId;
    let key1 = process.env.zlp_Key1;
    let endpoint = process.env.zlp_Endpoint;
    let returnUrl = process.env.zlp_ReturnUrl;
    const embed_data = {
        redirecturl: 'http://localhost:3000/order/zalopay_return',
    };
    let order = {
        app_id: appid,
        app_trans_id: `${moment().format('YYMMDD')}_${bookingId}`, // Transaction ID format: yymmdd_BookingID
        app_user: req.user.username,
        app_time: Date.now(), // Current timestamp in milliseconds
        item: JSON.stringify([{itemid: "1", itemname: "Movie Ticket", price: totalAmount, quantity: 1}]),
        embed_data: JSON.stringify({embed_data}),
        amount: totalAmount,
        callback_url: 'http://localhost:3000/order/zalopay_return',
        description: `Thanh toan ve xem phim Booking ID: ${bookingId}`,
        bank_code: "",
    };

    let data = `${appid}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, key1).toString();
    const response = await axios.post(endpoint, null, {params: order});
    if (response.data.return_code === 1) {
        return response.data.order_url;
    } else {
        throw new Error(`ZaloPay Error: ${response.data.return_message}`);
    }
}

exports.zaloPayReturn = async function (req, res, next) {
    try {
        const {data, mac} = req.query;
        const key2 = process.env.zlp_Key2;

        // Verify signature
        const computedMac = crypto.createHmac("sha256", key2).update(data).digest("hex");
        if (computedMac !== mac) {
            console.error("Invalid ZaloPay signature.");
            return res.render("success", {code: "97", message: "Invalid security hash."});
        }

        const paymentData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        const {app_trans_id, return_code} = paymentData;

        const bookingId = app_trans_id.split("_")[1]; // Extract booking ID
        console.log(`Extracted Booking ID: ${bookingId}`);

        if (return_code === 1) {
            // Payment successful
            await sequelize.transaction(async (t) => {
                const booking = await Booking.findOne({where: {bookingID: bookingId}});
                if (!booking) throw new Error("Booking not found.");

                booking.paymentStatus = "Paid";
                await booking.save({transaction: t});
                console.log(`Booking status updated to Paid for Booking ID: ${bookingId}`);

                await Ticket.update(
                    {status: "Booked"},
                    {where: {bookingId}, transaction: t}
                );
            });
            res.render("success", {code: "00", message: "Payment successful!"});
        } else {
            // Payment failed
            res.render("success", {code: return_code, message: "Payment failed. Please try again."});
        }
    } catch (error) {
        console.error("Error processing ZaloPay return:", error);
        res.render("success", {message: "An error occurred. Please contact support."});
    }

};

exports.zaloPayIPN = async function (req, res, next) {
    try {
        const {data, mac} = req.body;
        const key2 = process.env.ZALOPAY_KEY2;

        // Verify signature
        const computedMac = crypto.createHmac("sha256", key2).update(data).digest("hex");
        if (computedMac !== mac) {
            console.error("Invalid ZaloPay signature.");
            return res.status(400).send("Invalid Security Hash");
        }

        const paymentData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        const {app_trans_id, return_code} = paymentData;

        const bookingId = app_trans_id.split("_")[1];
        console.log(`Extracted Booking ID: ${bookingId}`);

        if (return_code === 1) {
            // Update booking and ticket status
            await sequelize.transaction(async (t) => {
                const booking = await Booking.findOne({where: {bookingID: bookingId}});
                if (!booking) throw new Error("Booking not found.");

                booking.paymentStatus = "Paid";
                await booking.save({transaction: t});
                console.log(`Booking status updated to Paid for Booking ID: ${bookingId}`);

                await Ticket.update(
                    {status: "Booked"},
                    {where: {bookingID: bookingId}, transaction: t}
                );
            });
            res.status(200).send("OK");
        } else {
            res.status(400).send("Payment Failed");
        }
    } catch (error) {
        console.error("Error processing ZaloPay IPN:", error);
        res.status(500).send("Internal Server Error");
    }
};
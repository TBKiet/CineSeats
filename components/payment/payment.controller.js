const moment = require('moment');
let querystring = require('qs');
let crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');
const { Booking, Ticket, sequelize } = require('../../api/booking/booking_model/index'); // Adjust the path if necessary
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
const generateBookingID = () => {
    // Remove hyphens and take the first 9 characters after 'B' to make total 10
    return 'B' + uuidv4().replace(/-/g, '').slice(0, 9);
};
const generateTicketID = () => {
    // Remove hyphens and take the first 9 characters after 'TK' to make total 10
    return 'TK' + uuidv4().replace(/-/g, '').slice(0, 8);
};
exports.createPaymentUrl = async function (req, res, next) {
    try {
        await sequelize.transaction(async (t) => {
            const { totalAmount, paymentMethod, selectedSeats, showtimeId } = req.body;
            const userId = "U0001";
            if (!userId || !totalAmount || !paymentMethod || !selectedSeats || !showtimeId) {
                throw new Error('Missing required payment details.');
            }
            // Create a new booking record
            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');
            const bookingId = generateBookingID();
            console.log(bookingId);
            const booking = await Booking.create({
                bookingID: bookingId,
                userId: userId,
                totalAmount: totalAmount,
                paymentStatus: "Pending",
                paymentMethod: paymentMethod,
                bookingDateTime: date,
            }, { transaction: t });
            const ticketPromises = selectedSeats.map(async (seat) => {
                const ticketId = generateTicketID(); // Example: TK16342323
                const price = 50;
                return Ticket.create({
                    ticketID: ticketId,
                    bookingId: bookingId,
                    showtimeId: showtimeId,
                    seatId: seat,
                    price: price,
                    status: 'Booked'
                }, { transaction: t });
            });

            await Promise.all(ticketPromises);
            process.env.TZ = 'Asia/Ho_Chi_Minh';

            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            let tmnCode = process.env.vnp_TmnCode;
            let secretKey = process.env.vnp_HashSecret;
            let vnpUrl = process.env.vnp_Url;
            let returnUrl = process.env.vnp_ReturnUrl;
            let orderId = bookingId;
            let amount = totalAmount;

            let locale = 'vn';
            let currCode = 'VND';
            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;

            vnp_Params = sortObject(vnp_Params);


            let signData = querystring.stringify(vnp_Params, { encode: false });

            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            console.log(vnpUrl);
            res.redirect(vnpUrl);
        });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};
exports.vnpayReturn = async function (req, res, next) {
    try {
        let vnp_Params = req.query;

        let secureHash = vnp_Params['vnp_SecureHash'];

        // Remove 'vnp_SecureHash' and 'vnp_SecureHashType' from parameters
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sort the parameters
        vnp_Params = sortObject(vnp_Params);

        // Retrieve configuration values
        let tmnCode = process.env.vnp_TmnCode // VNPAY TmnCode (merchant code)
        let secretKey = process.env.vnp_HashSecret; // VNPAY Secret Key

        // Generate the signature
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            // Signature is valid

            // Extract necessary parameters
            let rspCode = vnp_Params['vnp_ResponseCode'];
            let orderId = vnp_Params['vnp_TxnRef']; // This should match bookingID

            if (rspCode === "00") {
                // Payment successful
                console.log(`Payment successful for Booking ID: ${orderId}`);
                res.render('success', { code: rspCode, message: 'Payment successful!' });
            } else {
                // Payment failed or other status
                console.warn(`Payment failed for Booking ID: ${orderId} with Response Code: ${rspCode}`);
                res.render('success', { code: rspCode, message: 'Payment failed. Please try again.' });
            }
        } else {
            // Invalid signature
            console.error('Invalid VNPAY signature.');
            res.render('success', { code: '97', message: 'Invalid security hash.' });
        }
    } catch (error) {
        console.error('Error processing VNPAY return:', error);
        res.render('success', { message: 'An error occurred. Please contact support.' });
    }
};
exports.vnpayIPN = async function (req, res, next) {
    try {
        console.log('Processing VNPAY IPN...');
        // Step 1: Extract VNPAY IPN parameters from the query string
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        // Step 2: Remove 'vnp_SecureHash' and 'vnp_SecureHashType' from parameters
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Step 3: Sort the remaining parameters
        vnp_Params = sortObject(vnp_Params);

        // Step 4: Generate the signature hash using the secret key
        let secretKey = process.env.vnp_HashSecret; // Ensure this environment variable is set
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        // Initialize paymentStatus
        let paymentStatus = '0'; // 0: Initiated, 1: Success, 2: Failed

        // Step 5: Compare the generated signature with the received 'vnp_SecureHash'
        if (secureHash === signed) { // Verify checksum
            // Step 6: Check if orderId exists in the database
            let orderId = vnp_Params['vnp_TxnRef']; // This should match bookingID
            const booking = await Booking.findOne({ where: { bookingID: orderId } });
            let checkOrderId = !!booking; // Boolean indicating existence

            if (!checkOrderId) {
                console.error(`Booking with ID ${orderId} not found.`);
                return res.status(404).send('Booking not found.');
            }

            // Step 7: Check if the amount matches
            let vnpAmount = parseInt(vnp_Params['vnp_Amount'], 10) / 100; // Amount in VND, e.g., 1000000
            let expectedAmount = parseInt(booking.totalAmount); // Assuming totalAmount is in thousand VND
            console.log(vnpAmount, expectedAmount);
            let checkAmount = (vnpAmount === expectedAmount);

            if (!checkAmount) {
                console.error(`Amount mismatch for Booking ID ${orderId}: received ${vnpAmount}, expected ${expectedAmount}.`);
                return res.status(400).send('Amount mismatch.');
            }

            // Step 8: Check payment status before updating
            if (paymentStatus === "0") { // Transaction is in initial state
                let rspCode = vnp_Params['vnp_ResponseCode']; // Response code from VNPAY

                if (rspCode === "00") {
                    // Payment successful
                    paymentStatus = '1';

                    // Start a transaction
                    await sequelize.transaction(async (t) => {
                        // Update booking payment status to 'Success'
                        booking.paymentStatus = "Paid";
                        await booking.save({ transaction: t });

                        // Update associated tickets to 'Booked'
                        await Ticket.update(
                            { status: 'Booked' },
                            { where: { bookingID: orderId }, transaction: t }
                        );
                    });

                    console.log(`Payment successful for Booking ID: ${orderId}`);
                    res.status(200).send("OK"); // Respond to VNPAY
                } else {
                    // Payment failed or other status
                    paymentStatus = '2';

                    // Start a transaction
                    await sequelize.transaction(async (t) => {
                        // Update booking payment status to 'Failed'
                        booking.paymentStatus = "Failed";
                        await booking.save({ transaction: t });

                        // Update associated tickets to 'Canceled'
                        await Ticket.update(
                            { status: 'Canceled' },
                            { where: { bookingID: orderId }, transaction: t }
                        );
                    });

                    console.warn(`Payment failed for Booking ID: ${orderId} with Response Code: ${rspCode}`);
                    res.status(200).send("OK"); // Respond to VNPAY
                }
            } else {
                // Payment status is already updated
                console.warn(`Payment status already updated for Booking ID: ${orderId}.`);
                res.status(200).send("OK"); // Respond to VNPAY
            }
        } else {
            // Invalid signature
            console.error('Invalid VNPAY signature.');
            res.status(400).send("Invalid Security Hash");
        }
    } catch (error) {
        console.error('Error processing VNPAY IPN:', error);
        res.status(500).send("Internal Server Error");
    }
};
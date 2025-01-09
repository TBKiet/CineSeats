const express = require('express'); // npm install express
const bodyParser = require('body-parser'); // npm install body-parser
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment

const app = express();

// APP INFO
const config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve a simple HTML form
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Test</title>
    </head>
    <body>
      <h1>Test Payment API</h1>
      <form id="paymentForm" method="POST" action="/payment">
        <label for="amount">Amount:</label>
        <input type="number" id="amount" name="amount" required>
        <button type="submit">Create Payment</button>
      </form>
    </body>
    </html>
  `);
});

// Payment endpoint
app.post('/payment', async (req, res) => {
    const {amount} = req.body;

    const embed_data = {
        redirecturl: 'https://phongthuytaman.com',
    };
    const items = [];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: 'user123',
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: parseInt(amount, 10), // Ensure amount is a number
        callback_url: 'https://b074-1-53-37-194.ngrok-free.app/callback',
        description: `Payment for order #${transID}`,
        bank_code: '',
    };

    const data =
        `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;

    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    console.log(order);
    try {
        const result = await axios.post(config.endpoint, null, {params: order});

        // Redirect to the order_url returned by ZaloPay
        if (result.data.order_url) {
            return res.redirect(result.data.order_url);
        } else {
            return res.status(400).send('Failed to create payment order.');
        }
    } catch (error) {
        console.error('Error creating payment:', error.message);
        return res.status(500).send('Internal Server Error');
    }
});

// Start server
app.listen(8888, () => {
    console.log('Server is listening at http://localhost:8888');
});

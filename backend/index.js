const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10kb'
}));

app.use(cors({
    origin: process.env.FRONTEND_ADDRESS
}));

// Rate limit
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false
});

// Mail
let transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
    }
});

// POST - contact
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message, website } = req.body;

    // Honeypot
    if (website) {
        return res.status(400).send('Invalid request');
    }

    // Basic validation
    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof subject !== 'string' ||
        typeof message !== 'string'
    ) {
        return res.status(400).send('Invalid request');
    }

    // Length limits
    if (
        name.length > 100 ||
        email.length > 254 ||
        subject.length > 200 ||
        message.length > 5000
    ) {
        return res.status(400).send('Input too long');
    }

    let mailOptions = {
        replyTo: email,
        from: process.env.MAIL_ADDRESS,
        to: process.env.MAIL_ADDRESS,
        subject: 'Kontaktformular: ' + subject,
        text: `
Kontaktformular-Anfrage\n
Name: ${name}\n
E-Mail: ${email}\n
Betreff: ${subject}\n
Nachricht:\n
\n
${req.body.message}
`
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        res.status(500).redirect(process.env.FRONTEND_ADDRESS + "/booking/error");
    } else {
        console.log('Email sent: ' + info.response);
        res.status(201).redirect(process.env.FRONTEND_ADDRESS + "/booking/success");
    }
    });
});

app.listen(8080, () => {
  console.log('REST API server running on port 8080');
});
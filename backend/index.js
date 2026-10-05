const express = require('express');
const bodyParser = require('body-parser');
const env = require('node:process');
const nodemailer = require('nodemailer');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Mail
let transporter = nodemailer.createTransport({
    service: env.MAIL_SERVICE,
    auth: {
        user: env.MAIL_ADDRESS,
        pass: env.MAIL_PASSWORD
    }
});

// POST - contact
app.post('/api/contact', (req, res) => {
    console.log(req.body)
    let mailOptions = {
        from: req.body.email,
        to: env.MAIL_ADDRESS,
        subject: 'Kontaktformular: ' + req.body.subject,
        text: `
            Kontaktformular-Anfrage\n
            Name: ${req.body.name}\n
            E-Mail: ${req.body.email}\n
            Betreff: ${req.body.email}\n
            Nachricht:\n
            \n
            ${req.body.message}
        `
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        res.status(500);
    } else {
        console.log('Email sent: ' + info.response);
        res.status(201).redirect(env.FRONTEND_ADDRESS + "/booking/success");
    }
    });
});

app.listen(8080, () => {
  console.log('REST API server running on port 8080');
});
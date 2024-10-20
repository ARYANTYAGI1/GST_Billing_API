const nodemailer = require('nodemailer');
const path = require('path');

// Email sending function
const sendEmail = async (to, options, template) => {
    // Dynamically import the nodemailer-express-handlebars module
    const nodemailerHbs = (await import('nodemailer-express-handlebars')).default;

    const optionsData = {
        viewEngine: {
            extname: '.html',
            layoutsDir: path.resolve('templates'),
            defaultLayout: template,
            partialsDir: path.resolve('templates')
        },
        viewPath: path.resolve('templates'),
        extName: '.html'
    };

    // Create the transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Adjust service as necessary
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Use the plugin after dynamic import
    transporter.use('compile', nodemailerHbs(optionsData));

    const emailBodyOptions = {
        from: options.From ? options.From : process.env.EMAIL_USER,
        to: to.email,
        subject: options.subject || options.Subject,
        template: template,
        context: {
            name: to.name,
            options: options,
        }
    };

    // Send the email
    transporter.sendMail(emailBodyOptions, function (error, response) {
        if (error) {
            console.log("Error sending email to " + to.email, error);
        } else {
            console.log("Mail sent to " + to.email);
        }
    });
};

module.exports = { sendEmail };

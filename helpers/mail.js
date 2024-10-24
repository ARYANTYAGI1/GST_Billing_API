const mailjet = require('node-mailjet');
const mailjetClient = mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
);
const path = require('path');
const fs = require('fs');
const sendEmail = async (to, name, subject, templateName, context) => {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let emailTemplate = fs.readFileSync(templatePath, 'utf-8');
    for (const key in context) {
        emailTemplate = emailTemplate.replace(`{{${key}}}`, context[key]);
    }
    const request = mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MAILJET_FROM_EMAIL,
                    Name: 'LedgerHub Software Solutions'
                },
                To: [
                    {
                        Email: to,
                        Name: name
                    }
                ],
                Subject: subject,
                HTMLPart: emailTemplate,
            }
        ]
    });
    try {
        const result = await request;
        console.log('Email sent successfully:', result.body);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendEmail };

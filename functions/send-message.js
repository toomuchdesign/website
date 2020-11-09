const sgMail = require('@sendgrid/mail');
var emailValidator = require('email-validator');
const SENDER_EMAIL = process.env.SEND_EMAIL_TO;
const FORM_SPAM_FIELD = 'mail';

function sendEmail({to, replyTo, subject, text}) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    from: SENDER_EMAIL,
    to,
    replyTo,
    subject,
    text,
  };

  return sgMail
    .send(msg)
    .then(([res]) => ({statusCode: res.statusCode, body: res.body}));
}

function replyMessageTemplate({name, message, senderEmail}) {
  return `Hi ${name},
thank you for contacting me.

I'll endeavour to reply to you shortly.
Below you'll find a copy of your message.

Greetings!
Andrea Carraro

------+------
${message}
------+------
andreacarraro.it | ${senderEmail}`;
}

exports.handler = function(event, context, callback) {
  if (event.httpMethod !== 'POST') {
    return {statusCode: 405, body: 'Method Not Allowed'};
  }

  const data = JSON.parse(event.body);

  if (!data.message) {
    callback(new Error('Validation error: no message provided'));
  }

  if (!data.name) {
    callback(new Error('Validation error: no name provided'));
  }

  if (!emailValidator.validate(data.email)) {
    callback(new Error('Validation error: invalid email provided'));
  }

  if (data[FORM_SPAM_FIELD]) {
    callback(new Error('Validation error: spam field NOT empty'));
    return;
  }

  const emailToUser = sendEmail({
    to: data.email,
    replyTo: SENDER_EMAIL,
    subject: 'andreacarraro.it: message received!',
    text: replyMessageTemplate({
      name: data.name,
      message: data.message,
      senderEmail: SENDER_EMAIL,
    }),
  });

  const emailToAdmin = sendEmail({
    to: SENDER_EMAIL,
    replyTo: data.email,
    subject: 'Message sent from andreacarraro.it',
    text: data.message,
  });

  Promise.all([emailToUser, emailToAdmin])
    .then(([emailUserResponse]) => callback(null, emailUserResponse))
    .catch(errors => callback(errors, null));
};

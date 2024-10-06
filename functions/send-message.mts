import type {Context} from '@netlify/functions';
import sendGridMail from '@sendgrid/mail';
import emailValidator from 'email-validator';
import config from './config.mts';

const FORM_SPAM_FIELD = 'mail';
sendGridMail.setApiKey(config.SENDGRID_API_KEY);

async function sendEmail({
  to,
  replyTo,
  subject,
  text,
}: {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}): Promise<{
  statusCode: number;
  body: object;
}> {
  const msg = {
    from: config.SEND_EMAIL_TO,
    to,
    replyTo,
    subject,
    text,
  };

  const [response] = await sendGridMail.send(msg);
  return response;
}

function replyMessageTemplate({
  name,
  message,
  senderEmail,
}: {
  name: string;
  message: string;
  senderEmail: string;
}): string {
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

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return {statusCode: 405, body: 'Method Not Allowed'};
  }

  const body = await req.json();

  if (!body.message) {
    throw new Error('Validation error: no message provided');
  }

  if (!body.name) {
    throw new Error('Validation error: no name provided');
  }

  if (!emailValidator.validate(body.email)) {
    throw new Error('Validation error: invalid email provided');
  }

  if (body[FORM_SPAM_FIELD]) {
    throw new Error('Validation error: spam field NOT empty');
  }

  const emailToUser = sendEmail({
    to: body.email,
    replyTo: config.SEND_EMAIL_TO,
    subject: 'andreacarraro.it: message received!',
    text: replyMessageTemplate({
      name: body.name,
      message: body.message,
      senderEmail: config.SEND_EMAIL_TO,
    }),
  });

  const emailToAdmin = sendEmail({
    to: config.SEND_EMAIL_TO,
    replyTo: body.email,
    subject: 'Message sent from andreacarraro.it',
    text: body.message,
  });

  await Promise.all([emailToUser, emailToAdmin]);
  return new Response();
};

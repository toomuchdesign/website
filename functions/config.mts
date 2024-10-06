const {SEND_EMAIL_TO, SENDGRID_API_KEY} = process.env;

if (!SENDGRID_API_KEY) {
  throw new Error('"SENDGRID_API_KEY" env var not defined');
}

if (!SEND_EMAIL_TO) {
  throw new Error('"SEND_EMAIL_TO" env var not defined');
}

export default {SENDGRID_API_KEY, SEND_EMAIL_TO};

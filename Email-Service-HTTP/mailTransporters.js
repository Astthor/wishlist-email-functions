const mailer = require('nodemailer');
const acc = require('../local.settings.json');

/**
 * Temporary location in local settings.
 * 
 * Later we can create dynamic setup, where within an admin panel we can
 * add and remove emails, passwords and set access limits to each.
 */
const gmailAccounts = acc.GMAIL_ACCOUNTS;

const map = new Map();
const mapAuth = new Map();

gmailAccounts.forEach(e => {
	const transporter = mailer.createTransport({
		host: process.env.SMPT_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: e.email,
			pass: e.password
		}
	});
	map.set(e.email, transporter);
	if(e.access_password){
		mapAuth.set(e.email, e.access_password);
	}
});

// Not in use as default, but it is the same as in the "gmailAccounts" array and will be used primarily for all emails.
map.set("default", mailer.createTransport({
	host: process.env.SMPT_HOST,
  port: process.env.SMTP_PORT,
  auth: {
		user: process.env.SMTP_USER,
    pass: process.env.SMPT_PASSWORD
  },
}));

// Used for notification/debug emails 
// - set by the sender to get notified of a success or failure sending an email
map.set("notification", mailer.createTransport({
	host: process.env.SMPT_HOST,
  port: process.env.SMTP_PORT,
  auth: {
		user: process.env.NOTIFICATION_EMAIL,
    pass: process.env.NOTIFICATION_PASSWORD
  },
}));

// Not in use
map.set("error", mailer.createTransport({
	host: process.env.SMPT_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.ERROR_EMAIL,
		pass: process.env.ERROR_PASSWORD
	},
}));

module.exports = {map, mapAuth};

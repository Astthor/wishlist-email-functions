const mailer = require('nodemailer');
const acc = require('./gmail-accounts.json');

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
		host: "smtp.gmail.com",
		port: 587,
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

module.exports = {map, mapAuth};

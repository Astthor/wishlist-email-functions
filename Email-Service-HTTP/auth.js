const mailTransporters = require('./mailTransporters.js');

const mapAuth = mailTransporters.mapAuth;

const authorized = (passwordSent, passwordStored) => {
	return passwordSent === passwordStored
}

const authenticateSender = (sender) => {
	let errorMessage = "";
	try {
		if(mapAuth.has(sender.email) && !authorized(sender.password, mapAuth.get(sender.email))){
			errorMessage += ";You're unauthorized to use this email account";
			throw new Error(errorMessage);
		}

		return {success: "Authorized"};

	} catch(e) {
		if(errorMessage !== "") {
			return {error: errorMessage};
		} else {
			throw new Error(e.message);
		}
	}
}

module.exports = authenticateSender;
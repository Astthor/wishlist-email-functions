const emailTemplateContent = require('./content.js');
const constructNotificationEmail = (email, notification, error) => {
	let errorMessage = "";
	try {
		if(!notification){
			errorMessage += ";Notification properties are required - Most likely en error in the code.";
			throw new Error(errorMessage);
		}

		const validSuccess = notification.onSuccess === true && error === null;
		const validFailure = notification.onFailure === true && error !== null;

		if(!validSuccess && !validFailure){
			errorMessage += ";Logic in the code has been broken. Contact an administrator.";
			throw new Error(errorMessage);
		}

		let subject = "";
		let htmlContent = "";
		if(error){
			subject = "ERROR: Wishlist Information notification";
			htmlContent = emailTemplateContent.getErrorMessage(JSON.stringify(error), JSON.stringify(email));
		} else {
			subject = "SUCCESS: Wishlist Information notification";
			htmlContent = emailTemplateContent.getSuccessMessage(JSON.stringify(email));
		}

		const mail = {
			to: notification.email,
			subject: subject,
			html: htmlContent
		}

		return {success: mail};

	} catch(e) {
		if(errorMessage !== "") {
			return {error: errorMessage};
		} else {
			throw new Error(e.message);
		}
	}
}

const constructEmail = (email) => {
	try {
		let toEmailsString = "";
		if(Array.isArray(email.to)) {
			email.to.forEach(async (element, i) => {
				if(i === 0){
					toEmailsString = element;
				} else {
					toEmailsString += ", " + element;
				}
			});
		} else {
			
			toEmailsString += email.to;
		}

		const mail = {
			to: toEmailsString,
			subject: email.subject,
			html: email.html,
			text: email.text			
		}

		if((email.html instanceof String || typeof email.html === "string") && email.html !== ""){
			delete email.text;
		} else {
			delete email.html;
		}

		return {success: mail};
	} catch(e) {
		throw new Error(e.message);
	}
}

module.exports = {constructEmail, constructNotificationEmail}
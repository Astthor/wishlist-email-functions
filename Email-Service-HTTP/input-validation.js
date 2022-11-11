// ----------------------------------------------------------------
	// Type checks
// ----------------------------------------------------------------
const isObject = (obj) => {
	return typeof obj === 'object' && !Array.isArray(obj) && obj !== null
}

const isArray = (arr) => {
	return Array.isArray(arr) && arr !== null
}

const isString = (str) => {
	return str instanceof String || typeof str === "string";
}

const isBoolean = (bool) => {
	return bool === true || bool === false;
}

// ----------------------------------------------------------------
	// Application specific checks
// ----------------------------------------------------------------
const isEmail = (email) => {
	return String(email)
	.toLowerCase()
	.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
}

const isSafeHtml = (html) => {
	// TODO: Implement sanitation check for html content.
	return true;
}

// ----------------------------------------------------------------
	// Validation checks / Content checks
// ----------------------------------------------------------------


/**
 * Checks for correct fields, field types, and field values.
 * @param {*} body 
 */
const contentGuard = (body) => {
	let errorMessage = "";
	let senderError = false;
	let emailError = false;
	let notificationError = false;

	try{
		const sender = body.sender;
		const email = body.email;
		const notification = body.notificaiton;

		// Validate Sender Object

		if(!isEmail(sender.email)){
			errorMessage += ";sender.email is missing or invalid";
			senderError = true;
		}
		
		if(sender.password && !isString(sender.password)){
			errorMessage += ";sender.password is invalid";
			senderError = true;
		}

		// Validate Email Object

		if(isArray(email.to)){
			email.to.forEach((to) => {
        if(!isEmail(to)){
          errorMessage += ";invalid email";
					emailError = true;
        }
      });
		} else if (!isEmail(email.to)){
			errorMessage += ";email.to is missing or invalid";
			emailError = true;
		}

		if(!isString(email.subject)){
			errorMessage += ";email.subject is missing or invalid";
			emailError = true;
		}

		if(!isString(email.html) && !isString(email.text)){
			errorMessage += ";email.html or/and email.text are invalid or they are both missing";
			emailError = true;
		} else if(email.html === "" && email.text === ""){
			errorMessage += ";email.html and email.text are both empty strings";
		} else if (email.html && !isSafeHtml(email.html)) {
			errorMessage += ";email.html invalid";
			emailError = true;
		} 

		// Validate Notification Object if present

		if(notification){
			const notificationEmail = notification.email;
			const onFailure = notification.onFailure;
			const onSuccess = notification.onSuccess;
			if(!isEmail(notificationEmail)){
				errorMessage += ";notification.email is missing or invalid";
				notificationError = true;
			}
			if(!isBoolean(onFailure)){
				errorMessage += ";notification.onFailure is missing or invalid";
				notificationError = true;
			}
			if(!isBoolean(onSuccess)){
				errorMessage += ";notification.onSuccess is missing or invalid";
				notificationError = true;
			}
		}

		if(errorMessage !== ""){
      throw new Error(errorMessage);
    }
		return {success: "Content is valid"};

	} catch (e) {
		if(errorMessage !== ""){
			return {error: errorMessage, senderError: senderError, emailError: emailError, notificationError: notificationError};
		} else {
			throw new Error("Content Guard Failed - Unforseen error, see logs in console for details");
		}
	}
}

module.exports = contentGuard;

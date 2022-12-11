const mailTransporters = require('./mailTransporters.js');
const authenticateSender = require('./auth.js');
const contentGuard = require('./input-validation.js');
const { constructEmail, constructNotificationEmail } = require('./email-maker.js');

const UNKNOWN_ERROR_MSG = ";Unknown error. Check server logs or contact administrator for more information";

const map = mailTransporters.map;


const sendEmail = async (sender, email) => {
	let errorMessage = "";
	try {
		if(!map.has(sender.email)){ 
			errorMessage += ";sender.email: " + JSON.stringify(sender.email) + " does not exist";
			throw new Error(errorMessage);
		}
		const transporter = map.get(sender.email);

		console.log("email in sender: " + JSON.stringify(email));
		const info = await transporter.sendMail(email);
		const response = {
			accepted: info.accepted,
			rejected: info.rejected,
			messageTime: info.messageTime,
			messageSize: info.messageSize
		}

		return {sendMailResponse: response}
		
	} catch (e) {
		if(errorMessage !== ""){
			return {error: errorMessage};
		}
		throw new Error(e.message);
	}
}

module.exports = async function (context, req) {
	
	const response = {
		status: 200,
		body: {},
		headers: {
			'Content-Type': 'application/json'
		}
	}

	const successMessages = [];
	const errorMessages = [];
	const sendEmailResponses = [];

	let customErrors = "";
	let validNotificationObject = false;
	let successfullySentMail = false;

	try{
		const validContent = contentGuard(req.body);
		if(!validContent.notificationError) {
			validNotificationObject = true;
		}
		if(validContent.error){
			customErrors += validContent.error;
			errorMessages.push(validContent.error);
			throw new Error(validContent.error)
		} else {
			successMessages.push("Valid Content");
		}
		
		const validAuthentication = authenticateSender(req.body.sender);
		if(validAuthentication.error){
			customErrors += validAuthentication.error;
			errorMessages.push(validAuthentication.error);
			throw new Error(validAuthentication.error);
		} else {
			successMessages.push("Authentication success");
		}

		const email = constructEmail(req.body.email); // No custom errors in custructing email

		const emailResponse = await sendEmail(req.body.sender, email.success);

		if(emailResponse.error){
			customErrors += emailResponse.error;
			errorMessages.push(emailResponse.error);
			throw new Error(emailResponse.error)

		} else if(emailResponse.sendMailResponse) {
			sendEmailResponses.push(emailResponse.sendMailResponse);
			if(emailResponse.sendMailResponse.accepted.length > 0) {
				successfullySentMail = true;
				successMessages.push("Emails accepted: " + JSON.stringify(emailResponse.sendMailResponse.accepted));
			} 
			if (emailResponse.sendMailResponse.rejected.length > 0) {
				errorMessages.push("Emails rejected: " + JSON.stringify(emailResponse.sendMailResponse.rejected));
			}
		}
		
	} catch (e) {
		if(customErrors !== ""){
			response.status = 400;
			context.log("Custom errors thrown in sending email: " + customErrors);
		} else {
			context.log("Unkown error in sending email: " + e.message);
			response.status = 500;
			errorMessages.push(UNKNOWN_ERROR_MSG);
		}
	}


	if(validNotificationObject && req.body.notification) {
		let notificationErrors = "";
		try {
			let notificationEmail = {};
			const sendSuccess = (customErrors === "") && successfullySentMail && req.body.notification.onSuccess === true;
			const sendFailure = (customErrors !== "") && !successfullySentMail && req.body.notification.onFailure === true;
			
			if(sendSuccess){
				context.log("Going to send success notification")
				notificationEmail = constructNotificationEmail(req.body.email, req.body.notification, null);
			} else if (sendFailure) {
				context.log("Going to send failure notification")
				notificationEmail = constructNotificationEmail(req.body.email, req.body.notification, customErrors);
			}
			if(notificationEmail.error){
				notificationErrors += notificationEmail.error;
				errorMessages.push(notificationEmail.error);
				throw new Error(notificationEmail.error);

			} else if(notificationEmail.success){

				successMessages.push("valid notification email");

				const sender = {email: "notification.wishlist@gmail.com"};
				const notificationResponse = await sendEmail(sender, notificationEmail.success);

				if(notificationResponse){
					if(notificationResponse.error){
						notificationErrors += notificationResponse.error;
						errorMessages.push(notificationResponse.error);
						throw new Error(response.error);

					} else if (notificationResponse.sendMailResponse){
						sendEmailResponses.push(notificationResponse.sendMailResponse);
						if(notificationResponse.sendMailResponse.accepted.length > 0) {
							successMessages.push("Emails accepted: " + JSON.stringify(notificationResponse.sendMailResponse.accepted));
						} 
						if (notificationResponse.sendMailResponse.rejected.length > 0) {
							errorMessages.push("Emails rejected: " + JSON.stringify(notificationResponse.sendMailResponse.rejected));
						}
					} 
				}
			}
		} catch (e) {
			if(notificationErrors !== ""){
				customErrors += ";_;Notification Errors_" + notificationErrors;
				context.log("Custom errors throwns ending notification email: " + notificationErrors);
			} else {
				context.log("Unknown error, while sending notification email: " + e.message);
				errorMessages.push(UNKNOWN_ERROR_MSG);
			}
		}
	}

	
	response.body = {
		success: successMessages,
		errors: errorMessages,
		sentEmails: sendEmailResponses
	}

	context.log(
		`
			----------------------------------------------------------
			Finished!
			\nReport:
			\nDateTime: ${(new Date()).toISOString()}
			\nErrorMessages: ${JSON.stringify(errorMessages)}
			\nSuccessMessages: ${JSON.stringify(successMessages)}
			\nCustom Error Messages: ${customErrors}
			\nSentEmails: ${JSON.stringify(sendEmailResponses)}
			\n
			\nSending Response object: ${JSON.stringify(response)}
			----------------------------------------------------------
		`);

	context.res = response;
}

const getErrorMessage = (error, info) => {
	let today = (new Date()).toISOString();
	let errorMessage = 
		`
			<h1>Email server error</h1>
			<p>
				This email address was registered to get this notification of an error that occurred
				in our email server. 
			</p>
			<br>
			<p>
				Date: ${today}
			</p>
			<br>
		`;
	if(error) {
		errorMessage += `
			<p>
				Error Messages:
			</p>
			<br>
			<p> 
				${error}
			</p>
			<br>`;
	} else {
		errorMessage += 
		`
			<p>
				Error: Unfortunately we don't have any error message to display.
				Try checking the server or contact an administrator if you don't have access.
			</p>
			<br>
		`;
	}

	errorMessage += 
	`
		<p>
			Information about the failed email: 
		</p>
		<p>${info}</p>
	`;

	return errorMessage;
}

const getSuccessMessage = (information) => {
	let today = (new Date()).toISOString();
  let successMessage = 
    `
      <h1>Email server success</h1>
      <p>
        This email address was registered to get this notification of a successful email being sent
				Date: ${today}
			</p>
			<p>
				Information:
			</p>
			<p>
				${information}
			</p>
		`;
	return successMessage;
}

module.exports = {getErrorMessage, getSuccessMessage}


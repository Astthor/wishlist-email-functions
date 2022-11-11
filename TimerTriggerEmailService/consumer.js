//import { connect as _connect } from "amqplib";
const axios = require("axios");
const rabbit = require("amqplib")

const queueName = 'invite-email';

/*const consume = (context) => {
	console.log("Infinity")
	context.log("We're logging from consumer!");
};*/

const consume = async (context) => {
	console.log("We've consumed it!");
	/*
    try {
        const connection = await rabbit.connect("amqp://guest:guest@localhost:5672/");
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);
        
				try {
					let payloads = [];
					await channel.consume(queueName, m => {
						channel.ack(m);
						payloads.push(m.content.toString());
					});
					payloads.forEach(payload => console.log("payload: " + payload));

					let sent = [];
					let failed = [];
					payloads.forEach(async payload => {
						let response;
						try{
							response = await axios.post("http://localhost:3000/posting/", payload);
							if(response.statusCode === 200){
								sent.push(response.content);
							} else {
								failed.push(response);
							}
						} catch(e){
							failed.push(response);
						}
					});
					
					try {
						let res = await axios.get('http://localhost:3000/getting');
						context.log("response: " + JSON.stringify(res.data))
					} catch(e) {
						console.log("Error " + e.message);
					}
				}catch(e){
					console.log("Error rabbit: " + e.message);
				}

        context.log(`Waiting for messages from queueName: ${queueName}`);
    }
    catch (ex) {
			console.error(ex);
    }
		*/
}

module.exports = { consume };
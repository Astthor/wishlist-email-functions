//import {consume} from './consumer.js'
const consumer = require('./consumer.js');

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
		await consumer.consume(context);
		//await connect(context);
		console.log("We're in main")
		context.log('We should have some console logs now!');
    context.log('JavaScript timer trigger function ran!', timeStamp);   
};
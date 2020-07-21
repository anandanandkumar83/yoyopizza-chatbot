'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  	databaseURL: 'ws://yo-yo-pizza-bvpevd.firebaseio.com/'
});
 
process.env.DEBUG = 'dialogflow:debug';  
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  //var db = admin.database();
  //var ref = db.ref("server/saving-data/fireblog");
  
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function addorder(agent){
    const pizzatype = agent.parameters.pizzatype;
    const pizzasize = agent.parameters.pizzasize;
    const pizzacrust = agent.parameters.pizzacrust;
    const orderid = Math.floor((Math.random() * 9999) + 1000);
    const customername = agent.parameters.name;
    const customerphone = agent.parameters.phoneno;
    const customeraddress = agent.parameters.address;
       
    agent.add(`Your order id is ${orderid}. Great choice ${customername}..!! Type "Order status" to know your Order Status`);  
    return admin.database().ref('data').set({
    	type: pizzatype,
      size: pizzasize,
      crust: pizzacrust,
      orderid: orderid,
      name: customername,
      phoneno : customerphone,
      address: customeraddress
    });
    
  }
  function vieworderbyid(agent){
    const inputoid = agent.parameters.orderid;
    return admin.database().ref('data').once('value').then((snapshot)=>{
    const oid = snapshot.child('orderid').val();
    const ptype = snapshot.child('pizza_type').val();
    const cname = snapshot.child('name').val();
      if(oid==inputoid){
       agent.add(`Your OrderID is ${oid}. Your Delicious ${ptype} Pizza is got ready!! It's on the way to Home, ${cname}`);
      }
      else 
        agent.add(`Can you check your order id please`);
        
    });
  }
  
  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('pizza-userparticulars', addorder);
  intentMap.set('pizza-orderstatus', vieworderbyid);
  agent.handleRequest(intentMap);
});

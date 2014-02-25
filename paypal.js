var http = require('https'),
	url = require('url'),
	config = require('./config').devPaypalConfig

var DEFAULT_PORT = 443;
var DEFAULT_METHOD= 'POST';


var cancelPreapproval = function(request, response){

	var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

	var path = "/AdaptivePayments/CancelPreapproval/";
	var preapprovalKey = query.key;
	var errorLang = "en_US";

	var options = {
	  hostname: config.ENDPOINT,
	  port: DEFAULT_PORT,
	  path: path,
	  method: DEFAULT_METHOD,
	};

	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');

	  res.on('data', function (chunk) {
	  	console.log('BODY: ' + unescape(chunk));

	  	console.log(JSON.parse(chunk));
	  	data = JSON.parse(chunk);

		if(data.responseEnvelope.ack.toLowerCase() === 'success'){
			// log timestamp
			// email user?
			response.end(JSON.stringify(data));
	  	}
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	req.setHeader("X-PAYPAL-SECURITY-USERID", config.USER);
	req.setHeader("X-PAYPAL-SECURITY-PASSWORD", config.PWD);
	req.setHeader("X-PAYPAL-SECURITY-SIGNATURE", config.SIGNATURE);
	req.setHeader("X-PAYPAL-REQUEST-DATA-FORMAT", "NV") ;
	req.setHeader("X-PAYPAL-RESPONSE-DATA-FORMAT", "JSON");
	req.setHeader("X-PAYPAL-APPLICATION-ID", config.APPID); // SANDBOX APP ID, NEED TO GET OUR OWN
	
	var body = "clientDetails.applicationId=" + config.APPID;
	body += "&requestEnvelope.errorLanguage=" + errorLang;
	body += "&preapprovalKey=" + preapprovalKey;

	req.setHeader('content-length', body.length);

	req.write(body);
	
	console.log(req);
	req.end();
}

var preApprove = function(request, response){

	var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    var date_id = query.id;
    var amount = query.amount;

	var path = "/AdaptivePayments/Preapproval/";
	//var senderEmail = query.sender;//request.body.sender;
	var cancelUrl = "http://localhost:5000/paypal/preapproval/cancel/?date_id=" + date_id;
	var returnUrl = "http://localhost:5000/paypal/preapproval/success/?date_id=" + date_id;
	var currencyCode = "USD";
	var startingDate = new Date().toISOString();
	var endingDate = "2014-02-27T20:40:49.510Z";//new Date().toISOString();
	var maxAmountPerPayment = amount;//request.body.amount; // should be = participant1Total + participant2Total
	var maxNumberOfPayments = 1; // parallel payments count as 1 payment
	var maxTotalAmountOfAllPayments = amount;//request.body.amount; // should be = participant1Total + participant2Total
	var pinType = "NOT_REQUIRED";
	var errorLang = "en_US"; //requestEnvelope.errorLanguage=en_US
	var displayMaxTotalAmount = "true";

	var options = {
	  hostname: config.ENDPOINT,
	  port: DEFAULT_PORT,
	  path: path,
	  method: DEFAULT_METHOD,
	};

	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');

	  res.on('data', function (chunk) {
	  	console.log('BODY: ' + unescape(chunk));

	  	console.log(JSON.parse(chunk));
	  	data = JSON.parse(chunk);

	  	if(data.responseEnvelope.ack.toLowerCase() === 'success'){
	  		console.log('Preapproval Key: ' + data.preapprovalKey);
	  		console.log('RETURN URL: ' + returnUrl);
	  		// store in transaction table { user_id: user_id, date_id = date_id, timestamp: data.responseEnvelope.timestamp, sender: email, pin: "", preapprovalKey: data.preapprovalKey, status: "not-authorized"}
	  		// specify return address to be /paypal/preapproval/success which will just update record
	  		// now we can create a PayRequest passing in preapprovalKey and pin (optional)

	  		//TODO: insert Transaction record with date_id
	  		// then redirect to paypal

	  		response.writeHead(301,
			  {Location: "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-preapproval&preapprovalkey=" + data.preapprovalKey}
			);

			response.end(JSON.stringify({preapprovalKey: data.preapprovalKey }));
	  	}
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	req.setHeader("X-PAYPAL-SECURITY-USERID", config.USER);
	req.setHeader("X-PAYPAL-SECURITY-PASSWORD", config.PWD);
	req.setHeader("X-PAYPAL-SECURITY-SIGNATURE", config.SIGNATURE);
	req.setHeader("X-PAYPAL-REQUEST-DATA-FORMAT", "NV") ;
	req.setHeader("X-PAYPAL-RESPONSE-DATA-FORMAT", "JSON");
	req.setHeader("X-PAYPAL-APPLICATION-ID", "APP-80W284485P519543T"); // SANDBOX APP ID, NEED TO GET OUR OWN
	
	var body = "clientDetails.applicationId=APP-80W284485P519543T";
	//body += "&senderEmail=" + senderEmail;
	body += "&currencyCode=" + currencyCode;
	body += "&endingDate=" + endingDate;
	body += "&startingDate=" + startingDate;
	body += "&maxAmountPerPayment=" + maxAmountPerPayment;
	body += "&maxNumberOfPayments=" + maxNumberOfPayments;
	body += "&maxTotalAmountOfAllPayments=" + maxTotalAmountOfAllPayments;
	body += "&pinType=" + pinType;
	body += "&requestEnvelope.errorLanguage=" + errorLang;
	body += "&returnUrl=" + returnUrl;
	body += "&cancelUrl=" + cancelUrl;
	body += "&displayMaxTotalAmount=" + displayMaxTotalAmount;
	body += "&memo=You are giving a gift of $" + amount + " to be split between your friends for their date. This payment will only be made if both approve the date. Otherwise, you won't be charged.";

	req.setHeader('content-length', body.length);

	req.write(body);
	
	console.log(req);
	req.end();
}

var payRequest = function(request,response){

	// var url_parts = url.parse(request.url, true);
 //    var query = url_parts.query;

 //    var preapprovalKey = query.key;

    // going to have to be a post request
    //var preapprovalKey = request.body.key;
    //var recipient1 = request.body.participant1.email;
    //var recipient2 = request.body.participant2.email;

	var path = "/AdaptivePayments/Pay/";
	var actionType = "PAY";
	var senderEmail = "akjurczak@gmail.com";
	var cancelUrl = "http://trytangle.herokuapp.com/cancel";
	var returnUrl = "http://trytangle.herokuapp.com/success";
	var currencyCode = "USD";
	var recipient0Email = "bczulauf@gmail.com";
	var recipient0Amount = "5.00";
	var recipient1Email = "mollygil@gmail.com";
	var recipient1Amount = "5.00";
	var errorLang = "en_US"; //requestEnvelope.errorLanguage=en_US

	var options = {
	  hostname: config.ENDPOINT,
	  port: DEFAULT_PORT,
	  path: path,
	  method: DEFAULT_METHOD,
	};

	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');

	  res.on('data', function (chunk) {
	  	console.log('BODY: ' + unescape(chunk));

	  	console.log(JSON.parse(chunk));
	  	data = JSON.parse(chunk);

	  	if(data.responseEnvelope.ack.toLowerCase() === 'success'){
	  		console.log('PayKey: ' + data.payKey);

	  		// only needed without preapproval
	  		// response.writeHead(301,
			//   {Location: "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=" + data.payKey}
			// );
			response.end(JSON.stringify(data));
	  	}
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	/*
	actionType=PAY #The action taken in the Pay request (that is, the PAY action)
	&clientDetails.applicationId=APP-80W284485P519543T #Standard Sandbox App ID
	&clientDetails.ipAddress=127.0.0.1 #Address from which request is sent
	&senderEmail=sender_email
	&currencyCode=USD #The currency, e.g. US dollars
	&receiverList.receiver(0).amount=3.00 #The payment amount for the first receiver
	&receiverList.receiver(0).email=first_receiver_email
	&receiverList.receiver(1).amount=4.00 #The payment amount for the second receiver
	&receiverList.receiver(1).email=second_receiver_email
	&requestEnvelope.errorLanguage=en_US
	&returnUrl=http://www.yourdomain.com/success.html #For use if the consumer proceeds with payment
	&cancelUrl=
	*/

	req.setHeader("X-PAYPAL-SECURITY-USERID", config.USER);
	req.setHeader("X-PAYPAL-SECURITY-PASSWORD", config.PWD);
	req.setHeader("X-PAYPAL-SECURITY-SIGNATURE", config.SIGNATURE);
	req.setHeader("X-PAYPAL-REQUEST-DATA-FORMAT", "NV") ;
	req.setHeader("X-PAYPAL-RESPONSE-DATA-FORMAT", "JSON");
	req.setHeader("X-PAYPAL-APPLICATION-ID", "APP-80W284485P519543T"); // SANDBOX APP ID, NEED TO GET OUR OWN
	
	var body = "reverseAllParallelPaymentsOnError=true&actionType=" + actionType;
	body += "&clientDetails.applicationId=APP-80W284485P519543T";
	body += "&senderEmail=" + senderEmail;
	body += "&currencyCode=" + currencyCode;
	body += "&receiverList.receiver(0).email=" + recipient0Email;
	body += "&receiverList.receiver(0).amount=" + recipient0Amount;
	body += "&receiverList.receiver(1).email=" + recipient1Email;
	body += "&receiverList.receiver(1).amount=" + recipient1Amount;
	body += "&requestEnvelope.errorLanguage=" + errorLang;
	body += "&returnUrl=" + returnUrl;
	body += "&cancelUrl=" + cancelUrl;
	body += "&preapprovalKey=" + preapprovalKey;

	req.setHeader('content-length', body.length);

	req.write(body);
	
	console.log(req);
	req.end();
}

exports.payRequest = payRequest;
exports.preApprove = preApprove;
exports.cancelPreapproval = cancelPreapproval;
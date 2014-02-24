var http = require('https'),
	url = require('url')

var sandbox_paypal_endpoint = "svcs.sandbox.paypal.com";
var DEFAULT_PORT = 443;
var DEFAULT_METHOD= 'POST';

var sandbox_api_credentials = {
	USER : 'buddy_api1.tangleapp.com',
	PWD : '1393218843',
	SIGNATURE : 'A66nhHAywlZJ3sI.jJevN-w3VG8TA5yym7Nijw1Auz.pmfHUSxFIbfrT',
	APPID: "APP-80W284485P519543T"
};

var cancelPreapproval = function(request, response){

	var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

	var path = "/AdaptivePayments/CancelPreapproval/";
	var preapprovalKey = query.key;
	var errorLang = "en_US";

	var options = {
	  hostname: sandbox_paypal_endpoint,
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

	req.setHeader("X-PAYPAL-SECURITY-USERID", sandbox_api_credentials.USER);
	req.setHeader("X-PAYPAL-SECURITY-PASSWORD", sandbox_api_credentials.PWD);
	req.setHeader("X-PAYPAL-SECURITY-SIGNATURE", sandbox_api_credentials.SIGNATURE);
	req.setHeader("X-PAYPAL-REQUEST-DATA-FORMAT", "NV") ;
	req.setHeader("X-PAYPAL-RESPONSE-DATA-FORMAT", "JSON");
	req.setHeader("X-PAYPAL-APPLICATION-ID", sandbox_api_credentials.APPID); // SANDBOX APP ID, NEED TO GET OUR OWN
	
	var body = "clientDetails.applicationId=APP-80W284485P519543T";
	body += "&requestEnvelope.errorLanguage=" + errorLang;
	body += "&preapprovalKey=" + preapprovalKey;

	req.setHeader('content-length', body.length);

	req.write(body);
	
	console.log(req);
	req.end();
}

var preApprove = function(request, response){

	var path = "/AdaptivePayments/Preapproval/";
	var senderEmail = request.body.sender;//"akjurczak@gmail.com";
	var cancelUrl = "http://trytangle.herokuapp.com/cancel";
	var returnUrl = "http://localhost:5000/";
	var currencyCode = "USD";
	var startingDate = new Date().toISOString();
	var endingDate = "2014-02-27T20:40:49.510Z";//new Date().toISOString();
	var maxAmountPerPayment = request.body.amount;//"10.00"; // should be = participant1Total + participant2Total
	var maxNumberOfPayments = 1; // parallel payments count as 1 payment
	var maxTotalAmountOfAllPayments = request.body.amount; // should be = participant1Total + participant2Total
	var pinType = "NOT_REQUIRED";
	var errorLang = "en_US"; //requestEnvelope.errorLanguage=en_US
	var displayMaxTotalAmount = "true";

	var options = {
	  hostname: sandbox_paypal_endpoint,
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

	  		// now we can create a PayRequest passing in preapprovalKey and pin (optional)
			
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

	req.setHeader("X-PAYPAL-SECURITY-USERID", sandbox_api_credentials.USER);
	req.setHeader("X-PAYPAL-SECURITY-PASSWORD", sandbox_api_credentials.PWD);
	req.setHeader("X-PAYPAL-SECURITY-SIGNATURE", sandbox_api_credentials.SIGNATURE);
	req.setHeader("X-PAYPAL-REQUEST-DATA-FORMAT", "NV") ;
	req.setHeader("X-PAYPAL-RESPONSE-DATA-FORMAT", "JSON");
	req.setHeader("X-PAYPAL-APPLICATION-ID", "APP-80W284485P519543T"); // SANDBOX APP ID, NEED TO GET OUR OWN
	
	var body = "clientDetails.applicationId=APP-80W284485P519543T";
	body += "&senderEmail=" + senderEmail;
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
	body += "&memo=Only ONE payment will be sent to your friends for their date.";

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
	  hostname: sandbox_paypal_endpoint,
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

	req.setHeader("X-PAYPAL-SECURITY-USERID", sandbox_api_credentials.USER);
	req.setHeader("X-PAYPAL-SECURITY-PASSWORD", sandbox_api_credentials.PWD);
	req.setHeader("X-PAYPAL-SECURITY-SIGNATURE", sandbox_api_credentials.SIGNATURE);
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
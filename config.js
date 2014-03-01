exports.config = {
	DATABASE_URI: "mongodb://devuser:powerglove@ds033459.mongolab.com:33459/mashdev",
	EMAIL_USER_NAME: 'founders@trytangle.com',
	EMAIL_PASSWORD: 'thewizard',
	TECH_OPS: 'rnchell@gmail.com',
	EMAIL_ENABLED: false
};

exports.devPaypalConfig = {
	ENDPOINT: "svcs.sandbox.paypal.com",
	USER : 'buddy_api1.tangleapp.com',
	PWD : '1393218843',
	SIGNATURE : 'A66nhHAywlZJ3sI.jJevN-w3VG8TA5yym7Nijw1Auz.pmfHUSxFIbfrT',
	APPID: "APP-80W284485P519543T"
}

exports.prodPaypalConfig = {
	ENDPOINT: '',
	USER : '',
	PWD : '',
	SIGNATURE : '',
	APPID: ''
}
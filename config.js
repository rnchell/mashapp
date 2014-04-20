exports.config = {
	DATABASE_URI: "mongodb://devuser:powerglove@ds033579.mongolab.com:33579/mashdev02",
	EMAIL_USER_NAME: 'founders@trytangle.com',
	EMAIL_PASSWORD: 'thewizard',
	FACEBOOK_APP_ID: '232433826959882', // '1467905353425793'
	FACEBOOK_APP_SECRET: '18f9fec6b23ccc1f671fe1940db72357', // 'd6401fdf2a5a2fc5d67e928cd72ae240'
	TECH_OPS: 'rnchell@gmail.com',
	EMAIL_ENABLED: true,
	DEBUG_EMAILS: true
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

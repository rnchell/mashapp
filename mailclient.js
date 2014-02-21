var nodemailer = require("nodemailer");

var mailClient = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "user@gmail.com",
        pass: "password"
    }
});

var mailOptions = {
    from: "Mash App <mashapp@gmail.com>"
}

exports.sendNewUserEmail = function(user){

    mailOptions.to = user.email;
    mailOptions.subject = "Welcome to Mash";
    mailOptions.text = "Mash: Hook up your friends!";
    mailOptions.html = "<h2>Mash: Hook up your friends!</h2><p>Welcome, " + user.name + "!</p>";

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
         console.log(error);
        }else{
         console.log("Message sent: " + response.message);
        }
    });
}

exports.mailClient = mailClient;
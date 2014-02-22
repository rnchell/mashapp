var nodemailer = require("nodemailer");

var mailClient = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "user@gmail.com",
        pass: "password"
    }
});

var fromEmail = "Mash App <mashapp@gmail.com>";

exports.sendNewUserEmail = function(user){

    var mailOptions = {
        from: fromEmail,
        to: user.email,
        subject: "Welcome to Mash",
        text: "Mash: Hook up your friends!",
        html: "<h2>Mash: Hook up your friends!</h2><p>Welcome, " + user.name + "!</p>"
    };

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
         console.log(error);
        }else{
         console.log("Message sent: " + response.message);
        }
    });
}

exports.sendDateProposalEmail = function(date){

    var mailOptions = {
        from: fromEmail,
        to: date.participants[0].email + ', ' + date.participants[1].email,
        subject: "You have a new date proposal!",
        text: "",
        html: ""
    };

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
            // log and send techops email
            console.log('Error sending new Date Proposal: ' + error);
        } else{
            console.log('Message sent: ' + response.message);
        }
    });
}

exports.sendRejectionEmail = function(date, rejectee, rejector){

    var mailOptions = {
        from: fromEmail,
        to: rejectee.email,
        subject: rejector.name + " is a fool.",
        text: "",
        html: ""
    };

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
            // log and send techops email
            console.log('Error sending rejection email: ' + error);
        } else{
            console.log('Message sent: ' + response.message);
        }
    });
}

exports.sendDateAcceptedEmail = function(date){
    var mailOptions = {
        from: fromEmail,
        to: date.participants[0].email + ', ' + date.participants[1].email + ', ' + date.matchmaker.email,
        subject: "The date is on!",
        text: "",
        html: ""
    };

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
            // log and send techops email
            console.log('Error sending date accepted email: ' + error);
        } else{
            console.log('Message sent: ' + response.message);
        }
    });
}

exports.mailClient = mailClient;
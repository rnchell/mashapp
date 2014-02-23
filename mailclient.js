var nodemailer = require("nodemailer"),
    config = require('./config').config;

var mailClient = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.EMAIL_USER_NAME,
        pass: config.EMAIL_PASSWORD
    }
});

var fromEmail = "Tangle <tangle@gmail.com>";

exports.sendNewUserEmail = function(user){

    var mailOptions = {
        from: fromEmail,
        to: user.email,
        subject: "Welcome to Tangle",
        text: "Tangle: Hook up your friends!",
        html: "<h2>Tangle</h2> <h3>Hook up your friends!</h3><p>Welcome, " + user.name + "!</p>"
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

    for(var i=0; i < date.participants.length; i++){
        
        var mailOptions = {
            from: fromEmail,
            to: date.participants[(i + 1) % date.participants.length].email,
            subject: "You have a new date proposal!",
            text: date.matchmaker.name + " has proposed a date between you and " + date.participants[i].name + "!",
            html: "<h1>" + date.matchmaker.name + " has proposed a date between you and " + date.participants[i].name + " at " + date.location + "</h1><p><strong>Location:</strong> " + date.location + ".</p>"
        };

        console.log('Sending email to: ' + date.participants[(i + 1) % date.participants.length]);
        console.log(mailOptions);
        
        // mailClient.sendMail(mailOptions, function(error, response){
        //     if(error){
        //         // log and send techops email
        //         console.log('Error sending new Date Proposal: ' + error);
        //     } else{
        //         console.log('Message sent: ' + response.message);
        //     }
        // });
    }

}

exports.sendRejectionEmail = function(date, rejectee, rejector){

    var mailOptions = {
        from: fromEmail,
        to: rejectee.email,
        subject: rejector.name + " is a fool.",
        text: 'Tangle\r\n' + rejector.name + ' is a fool.',
        html: '<h1>Tangle</h1><br><br><p>' + rejector.name + ' is a fool.'
    };

    console.log('Sending RejectionEmail: ' + JSON.stringify(mailOptions));
    // mailClient.sendMail(mailOptions, function(error, response){
    //     if(error){
    //         // log and send techops email
    //         console.log('Error sending rejection email: ' + error);
    //     } else{
    //         console.log('Message sent: ' + response.message);
    //     }
    // });
}

exports.sendDateAcceptedEmail = function(date){
    var mailOptions = {
        from: fromEmail,
        to: date.participants[0].email + ', ' + date.participants[1].email + ', ' + date.matchmaker.email,
        subject: "The date is on!",
        text: "",
        html: ""
    };

    console.log('Sending DateAcceptedEmail: ' + JSON.stringify(mailOptions));
    // mailClient.sendMail(mailOptions, function(error, response){
    //     if(error){
    //         // log and send techops email
    //         console.log('Error sending date accepted email: ' + error);
    //     } else{
    //         console.log('Message sent: ' + response.message);
    //     }
    // });
}

exports.mailClient = mailClient;
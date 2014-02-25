var nodemailer = require("nodemailer"),
    config = require('./config').config,
    ejs = require('ejs')

var mailClient = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.EMAIL_USER_NAME,
        pass: config.EMAIL_PASSWORD
    }
});

var fromEmail = "tangle <tangle@gmail.com>";

exports.sendNewUserEmail = function(user, html){

    var mailOptions = {
        from: fromEmail,
        to: user.email,
        subject: "Welcome to tangle",
        text: "tangle: Hook up your friends!",
        html: html
    };

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
         console.log(error);
        }else{
         console.log("Message sent: " + response.message);
        }
    });
}

exports.sendDateProposalEmail = function(date, template){

    for(var i=0; i < date.participants.length; i++){
        
        var currentUser = date.participants[(i + 1) % date.participants.length];

        var mailOptions = {
            from: fromEmail,
            to: currentUser.email,
            subject: "You have a new date proposal!",
            text: date.matchmaker.name + " has proposed a date between you and " + date.participants[i].name + "!",
            html: ejs.render(template, {title: 'tangle', date: date, other: date.participants[i]})
        };

        console.log('Sending email to: ' + currentUser.email);
        console.log(mailOptions);
        
        mailClient.sendMail(mailOptions, function(error, response){
            if(error){
                // log and send techops email
                console.log('Error sending new Date Proposal: ' + error);
            } else{
                console.log('Message sent: ' + response.message);
            }
        });
    }

}

exports.sendRejectionEmail = function(date, rejectee, rejector, template){

    var mailOptions = {
        from: fromEmail,
        to: rejectee.email,
        subject: rejector.name + " is a fool.",
        text: 'Tangle\r\n' + rejector.name + ' is a fool.',
        html: ejs.render(template, {title: 'tangle', date: date, rejector: rejector})
    };

    console.log('Sending RejectionEmail: ' + JSON.stringify(mailOptions));
    
    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
            // log and send techops email
            console.log('Error sending rejection email: ' + error);
        } else{
            console.log('Message sent: ' + response.message);
        }
    });
}

exports.sendDateAcceptedEmail = function(date, template){

    var mailOptions = {
        from: fromEmail,
        to: date.participants[0].email + ', ' + date.participants[1].email + ', ' + date.matchmaker.email,
        subject: "The date is on!",
        text: "Location: " + date.location + "\r\n" + "Time: " + date.time,
        html: ejs.render(template, { title: 'tangle', date: date, first: date.participants[0], second: date.participants[1]})
    };

    console.log('Sending DateAcceptedEmail: ' + JSON.stringify(mailOptions));
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
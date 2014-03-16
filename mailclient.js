var nodemailer = require("nodemailer"),
    config = require('./config').config,
    ejs = require('ejs'),
    fs = require('fs')

var mailClient = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.EMAIL_USER_NAME,
        pass: config.EMAIL_PASSWORD
    }
});

var fromEmail = "tangle <" + config.EMAIL_USER_NAME + ">";

exports.sendNewUserEmail = function(user, html){

    if(!config.EMAIL_ENABLED)
        return;

    var toEmail = config.DEBUG_EMAILS ? config.TECH_OPS : user.email;

    var mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: "Welcome to tangle",
        text: "tangle: Hook up your friends!",
        html: html
    };

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
         console.log(error);
         sendErrorEmail('Error sending new user email: ' + error);
        }else{
         console.log("Message sent: " + response.message);
        }
    });
}

exports.sendDateProposalEmail = function(date, template){

    if(!config.EMAIL_ENABLED)
        return;

    for(var i=0; i < date.participants.length; i++){

        var currentUser = date.participants[(i + 1) % date.participants.length];
        var toEmail = config.DEBUG_EMAILS ? config.TECH_OPS : currentUser.email;

        var mailOptions = {
            from: fromEmail,
            to: toEmail,
            subject: "You have a new date proposal!",
            text: date.matchmaker.name + " has proposed a date between you and " + date.participants[i].name + "!",
            html: ejs.render(template, {title: 'tangle', date: date, other: date.participants[i]})
        };

        mailClient.sendMail(mailOptions, function(error, response){
            if(error){
                console.log('Error sending new Date Proposal: ' + error);
                sendErrorEmail('Error sending new Date Proposal: ' + error);
            } else{
                console.log('Message sent: ' + response.message);
            }
        });
    }
}

exports.sendRejectionEmail = function(date, rejectee, rejector, template){

    if(!config.EMAIL_ENABLED)
        return;

    var toEmail = config.DEBUG_EMAILS ? config.TECH_OPS : rejectee.email;

    var mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: rejector.name + " is a fool.",
        text: 'Tangle\r\n' + rejector.name + ' is a fool.',
        html: ejs.render(template, {title: 'tangle', date: date, rejector: rejector})
    };

    console.log('Sending RejectionEmail: ' + JSON.stringify(mailOptions));

    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
            console.log('Error sending rejection email: ' + error);
            sendErrorEmail('Error sending rejection email: ' + error)
        } else{
            console.log('Message sent: ' + response.message);
        }
    });
}

exports.sendDateAcceptedEmail = function(date, template){

    if(!config.EMAIL_ENABLED)
        return;

    var toEmail = config.DEBUG_EMAILS ? config.TECH_OPS : date.participants[0].email + ', ' + date.participants[1].email + ', ' + date.matchmaker.email;

    var mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: "The date is on!",
        text: "Location: " + date.location + "\r\n" + "Time: " + date.time,
        html: ejs.render(template, { title: 'tangle', date: date, first: date.participants[0], second: date.participants[1]})
    };

    console.log('Sending DateAcceptedEmail: ' + JSON.stringify(mailOptions));
    
    mailClient.sendMail(mailOptions, function(error, response){
        if(error){
            console.log('Error sending date accepted email: ' + error);
            sendErrorEmail('Error sending date accepted email: ' + error);
        } else{
            console.log('Message sent: ' + response.message);
        }
    });
}

exports.sendInvite = function(user, inviteSentBy){
    
    if(!config.EMAIL_ENABLED)
        return;

    var toEmail = config.DEBUG_EMAILS ? config.TECH_OPS : user.email;

    fs.readFile(__dirname + '/public/templates/InviteTemplate.html', 'utf-8', function(err, html) {
        if(!err) {
            
            var mailOptions = {
                from: fromEmail,
                to: toEmail,
                subject: "You've been invited to join tangle!",
                text: "tangle: Hook up your friends!",
                html: ejs.render(html, {title: 'tangle', user: user, sender: inviteSentBy})
            };

            mailClient.sendMail(mailOptions, function(error, response){
                if(error){
                 console.log(error);
                 sendErrorEmail('Error sending invite email: ' + error);
                }else{
                 console.log("Message sent: " + response.message);
                }
            });

        } else {
            console.log('Error sending invite email: ' + err);
        }
    });
}

var sendErrorEmail = function(msg){

    var mailOptions = {
        from: fromEmail,
        to: config.TECH_OPS,
        subject: "Error on tangle",
        text: msg,
        html: "<h2>" + msg + "</h2>"
    };

    mailClient.sendMail(mailOptions, function(error, response){});
}

exports.sendErrorEmail = sendErrorEmail;

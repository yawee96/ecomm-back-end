const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('');
 
// your create order method with email capabilities
exports.create = (req, res) => {
    console.log('CREATE ORDER: ', req.body);
};
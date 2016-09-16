var nodemailer = require('nodemailer')
var settings = require('../configs/settings.js').get()
var transporter = nodemailer.createTransport(settings.email.connect)

exports.send = function (message, cb) {
  var mailOptions = {
    to: message.to,
    from: settings.email.from,
    subject: message.subject,
    text: message.text
  }
  transporter.sendMail(mailOptions, function (err) {
    if (err)console.log('mail error:', err)
    cb(err)
  })
}

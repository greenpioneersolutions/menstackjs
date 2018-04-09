const sendmail = require('sendmail')()
const settings = require('../configs/settings.js').get()

module.exports = { send }

function send (message, cb) {
  const mailOptions = {
    to: message.to,
    from: settings.email.from,
    subject: message.subject,
    html: message.html
  }

  sendmail(mailOptions, cb)
}

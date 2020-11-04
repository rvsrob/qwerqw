let config2 = require('./config.json')
const config = {
  ownerID: config2.kurucu, //kendi IDınızı yazınız
  admins: config2.admin,
  token: config2.token, //botunuzun tokenini yazınız
  dashboard: {
    oauthSecret: config2.secret, //botunuzun secretini yazınız
    callbackURL: config2.callback, //site URLnizi yazınız /callback kısmını silmeyiniz!
    sessionSecret: "super-secret-session-thing", //kalsın dokunmayın...
    domain: config2.site //site URLnizi yazınız!
  }
};

module.exports = config;

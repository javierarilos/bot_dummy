var builder = require('botbuilder');

// Bot Factory function.
function getBot() {
  if (process.env.BOT_STDIN === 'true') { // Testing chat in console
    return new builder.TextBot();
  } else {                                // Serve chat over HTTP
    return new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
  }
}

function init(bot){
  bot.add('/', [
    function (session, args, next) {
      if (!session.userData.name) {
        session.beginDialog('/profile');
      } else {
        next();
      }
    },
    function (session, results) {
      session.send('Hello %s!', session.userData.name);
    }
  ]);
  bot.add('/profile', [
    function (session) {
      builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
      session.userData.name = results.response;
      session.endDialog();
    }
  ]);
}


exports.getBot = getBot;
exports.init = init

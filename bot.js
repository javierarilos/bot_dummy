var builder = require('botbuilder');

function getBot() {
  if (process.env.BOT_STDIN === 'true') { // Testing chat in console
    return new builder.TextBot();
  } else {                                // Serve chat over HTTP
    return new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
  }
}

function init(bot) {
  bot.add('/', function (session) {
      session.send('Hi, my name is Chati');
  });
}
exports.getBot = getBot;
exports.init = init

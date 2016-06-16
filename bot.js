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
      session.beginDialog('/agenda')
    }
  ]);

  bot.add('/profile', [
    function (session) {
      builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results, next) {
      session.userData.name = results.response;
      // session.endDialog();
      // session.next();
      next()
    },
  //   },]);
  //
  // bot.add('/cal_url', [
    function (session) {
      builder.Prompts.text(session, 'Hi! '+session.userData.name+', give me access to your calendar. Write your calendar URL.');
    },
    function (session, results, next) {
      session.userData.calendarUrl = results.response;
      next();
    },
    function (session, results, next) {
      session.send('OK %s now I can tell you about your appointments :)', session.userData.name);

      session.endDialog();
    }
  ]);

  var LUIS_URL = 'https://api.projectoxford.ai/luis/v1/application?id=85f7ae76-c768-4f0e-a1dd-f37d955ecc86&subscription-key=ca18b6de51b947af8869aa4b404160a1'
  var agendaDialog = new builder.LuisDialog(LUIS_URL);
  agendaDialog.on('list_agenda', builder.DialogAction.send('=== Para hoy:\n\t(8:00) comprar el pan \n\t(10:00) salir a correr \n\t(17:00) recoger a las niñas'));
  agendaDialog.on('help', builder.DialogAction.send('Soy tu gestor de agenda, símplemente dime qué eventos quieres consultar.'));
  agendaDialog.onDefault(builder.DialogAction.send("Lo siento, no te entiendo. Ya sabes que yo puedo enseñarte tu agenda."));

  bot.add('/agenda', agendaDialog)
}


exports.getBot = getBot;
exports.init = init

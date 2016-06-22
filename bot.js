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
    function (session, args, next) {
      if (!session.userData.calendarUrl) {
        session.beginDialog('/calendarUrl');
      } else {
        next();
      }
    },
    function (session, results) {
      session.beginDialog('/agenda');
    }
  ]);

  bot.add('/profile', [
    function (session) {
      builder.Prompts.text(session, 'Hola, soy ChatI, como te llamas?');
    },
    function (session, results, next) {
      session.userData.name = results.response;
      session.endDialog();
    },
  ]);

  bot.add('/calendarUrl', [
    function (session) {
      builder.Prompts.text(session, 'Hola, '+session.userData.name+', Puedo ayudarte con tu calendario,\npodrías darme la URL de tu calendario?');
    },
    function (session, results, next) {
      session.userData.calendarUrl = results.response;
      session.endDialog();
    }
  ]);

  var LUIS_URL = 'https://api.projectoxford.ai/luis/v1/application?id=85f7ae76-c768-4f0e-a1dd-f37d955ecc86&subscription-key=ca18b6de51b947af8869aa4b404160a1'
  var agendaDialog = new builder.LuisDialog(LUIS_URL);
  agendaDialog.setThreshold(0.6);  // Minimum utterance confidence to match a Dialog
  // agendaDialog.on('list_agenda', builder.DialogAction.send('=== Para hoy:\n\t(8:00) comprar el pan \n\t(10:00) salir a correr \n\t(17:00) recoger a las niñas'));
  agendaDialog.on('list_agenda', [
    function (session, args, next) {
        var from_date = builder.EntityRecognizer.findEntity(args.entities, 'from_date');
        if (!from_date) {
            builder.Prompts.text(session, "No estoy segura de entenderte bien... De cuando quieres ver tu agenda?");
        } else {
            next({ response: from_date.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            session.send("Ok... tu quieres tu agenda para '%s'.", results.response);
        } else {
            session.send("Ok");
        }
    }
  ]);
  agendaDialog.on('help', builder.DialogAction.send('Soy tu gestor de agenda, símplemente dime qué eventos quieres consultar.'));
  agendaDialog.onBegin(function(session){
    session.send('Estupendo, %s ahora te puedo ayudar a consultar tu agenda y taeas... :)', session.userData.name);
  });
  agendaDialog.onDefault(builder.DialogAction.send("Lo siento, no te entiendo... Todavía estoy aprendiendo ;) Yo puedo consultar tu agenda y tareas.\n¿Podrías repetir la pregunta de otra manera?"));

  bot.add('/agenda', agendaDialog)
}


exports.getBot = getBot;
exports.init = init

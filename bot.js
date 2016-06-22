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
      builder.Prompts.text(session, "Hi, I'm ChatI, what's your name?");
    },
    function (session, results, next) {
      session.userData.name = results.response;
      session.endDialog();
    },
  ]);

  bot.add('/calendarUrl', [
    function (session) {
      builder.Prompts.text(session, 'Hi, '+session.userData.name+', I can help you with your calendar and agenda,\nCan you, please, give your calendar URL?');
    },
    function (session, results, next) {
      session.userData.calendarUrl = results.response;
      session.endDialog();
    }
  ]);

  var LUIS_URL = 'https://api.projectoxford.ai/luis/v1/application?id=85f7ae76-c768-4f0e-a1dd-f37d955ecc86&subscription-key=ca18b6de51b947af8869aa4b404160a1'
  var agendaDialog = new builder.LuisDialog(LUIS_URL);
  agendaDialog.setThreshold(0.6);  // Minimum utterance confidence to match a Dialog
  agendaDialog.on('list_agenda', [
    function (session, args, next) {
        var from_date = builder.EntityRecognizer.findEntity(args.entities, 'from_date');
        if (!from_date) {
            builder.Prompts.text(session, "I think I don't understand... what day's agenda do you want to see?");
        } else {
            next({ response: from_date.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            session.send("Ok... here it's your agenda for '%s'.\n\t(8:00) go running\n\t(9:00) breakfast\n\t(11:00) project meeting\n\t(13:30) lunch with Kent", results.response);
        } else {
            session.send("Ok... what should I say... ;)");
        }
    }
  ]);
  agendaDialog.on('help', builder.DialogAction.send("I can help you query your agenda...\njust try something like: 'what is my agenda for wednesday?'"));
  agendaDialog.onBegin(function(session){
    session.send("Good, %s now I can help you query your agenda... if you need more info, ask for 'help' :)", session.userData.name);
  });
  agendaDialog.onDefault(builder.DialogAction.send("I think I don't understand... I am still learning...\nCan you try again? If you need some context, just ask for 'help' :)"));

  bot.add('/agenda', agendaDialog)
}


exports.getBot = getBot;
exports.init = init

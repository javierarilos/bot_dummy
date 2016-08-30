var builder = require('botbuilder');
var chrono = require('chrono-node');
var calendar_google = require('./calendar_google');
var util = require('util');

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

  // spanish LUIS app var LUIS_URL = 'https://api.projectoxford.ai/luis/v1/application?id=85f7ae76-c768-4f0e-a1dd-f37d955ecc86&subscription-key=ca18b6de51b947af8869aa4b404160a1'
  var LUIS_URL = 'https://api.projectoxford.ai/luis/v1/application?id=ec0f9635-a355-42ea-ba13-905d3f72af27&subscription-key=ca18b6de51b947af8869aa4b404160a1'
  var agendaDialog = new builder.LuisDialog(LUIS_URL);
  agendaDialog.setThreshold(0.6);  // Minimum utterance confidence to match a Dialog
  agendaDialog.on('agenda_query', [
    function (session, args, next) {
        console.log('================================')
        console.log('====', args)
        console.log('================================')
        // var datetime = builder.EntityRecognizer.findEntity(args.entities, 'datetime');
        var datetime = args.entities.filter(function(el){
          return el.type === 'builtin.datetime.date'
        })[0].entity || 'today';
        console.log('******* luis extracted datetime:', datetime)
        datetime = chrono.parse(datetime)[0].start.date()
        console.log('******* chronos parsed datetime:', datetime)
        if (!datetime) {
            builder.Prompts.text(session, "I think I don't understand... what day's agenda do you want to see?");
        } else {
            next({ response: datetime });
        }
    },
    function (session, results) {
        if (results.response) {
          var queryDate = results.response;
          function handleEvents(err, events){
            if (events == undefined || events.length === 0) {
              session.send('No upcoming events found for: %s.', queryDate);
            } else {
              response = 'Your events list for ' + queryDate + ' are:\n\n';
              for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                response += util.format('\t(%s) -> %s\n\n', start, event.summary);
              }
              session.send(response);
            }
          }
          calendar_google.getDayEvents(queryDate, handleEvents)
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

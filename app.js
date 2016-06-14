var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
function getBot() {
  if (process.env.BOT_STDIN === 'true') { // Testing chat in console
    return new builder.TextBot();
  } else {                                // Serve chat over HTTP
    return new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
  }
}

var bot = getBot();

bot.add('/', function (session) {
    session.send('Hello World');
});

// HTTP endpoint functions
function getChatPage(req, res, next) {
  res.setHeader('Content-Type', 'text/html');
  //res.contentType = 'text/html';
  res.end("<html><title>x</title><iframe  width='500' height='400' src='https://webchat.botframework.com/embed/AAAA-ZZZZ-1111-9999-bbbb-yyyy-2222-7777?s=mb5BZTQ1sSI.cwA.1L8.eAP0nXGGFc4IuY6Uvr_U1Dotyiju7p2u5LrTLeeZzOw'></iframe></html>");
  next();
}
builder
function getHealth(req, res, next) {
  res.send('health OK.');
  next();
}

// Termination handlers
function terminator (sig){
     if (typeof sig === "string") {
        console.log('%s: Received %s - terminating sample app ...',
                    Date(Date.now()), sig);
        process.exit(1);
     }
     console.log('%s: Node server stopped.', Date(Date.now()) );
 };

function setupTerminationHandlers (){
    //  Process on exit and signals.
    process.on('exit', function() { terminator(); });

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { terminator(element); });
    });
};

// Start server
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

if (process.env.BOT_STDIN === 'true') { // Testing chat in console
  bot.listenStdin();
} else {                                // Serve chat over HTTP
  // Setup Restify Server
  var server = restify.createServer();
  server.get('/', getChatPage);
  server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
  server.get('/health', getHealth);

  server.listen(port, ip, function () {
      console.log('%s listening to %s', server.name, server.url);
  });
}

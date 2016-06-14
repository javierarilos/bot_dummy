var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
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

function getHealth(req, res, next) {
  res.send('health OK.');
  next();
}


// Setup Restify Server
var server = restify.createServer();
server.get('/', getChatPage);
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.get('/health', getHealth);


// Start server
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

server.listen(port, ip, function () {
    console.log('%s listening to %s', server.name, server.url);
});

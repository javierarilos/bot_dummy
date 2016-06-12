var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
bot.add('/', function (session) {
    session.send('Hello World');
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.get('/health', function (req, res, next) {
  res.send('health OK.');
  next();
});
server.get('/', function (req, res, next) {
  res.send('hello there!!!!!!');
  next();
});

// Start server
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

server.listen(port, ip, function () {
    console.log('%s listening to %s', server.name, server.url);
});

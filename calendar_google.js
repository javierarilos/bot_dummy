var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// Load client secrets from a local file.
// Secret is a single JSON for the application.
console.log('Loading appSecret...');
var appSecret = JSON.parse(fs.readFileSync('client_secret.json'));
console.log('Loaded appSecret.');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(aDate, callback, auth) {
  aDate = aDate || new Date();
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    // calendarId: 'primary',
    calendarId: 'akjarb6e6vsc2jktdq39acdk3k@group.calendar.google.com',
    timeMin: (aDate).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      callback(err);
    }
    var events = response.items;
    callback(undefined, events);
  });
}

function getEvents(oneDate, callback){
  listOneDateEvents = listEvents.bind(undefined, oneDate, callback);
  authorize(appSecret, listOneDateEvents);
}

// console.log("====== static call to getEvents");
// getEvents(new Date(), function(err, events){
//   if (events.length == 0) {
//     console.log('No upcoming events found.');
//   } else {
//     console.log('Upcoming 10 events:');
//     for (var i = 0; i < events.length; i++) {
//       var event = events[i];
//       var start = event.start.dateTime || event.start.date;
//       console.log('%s - %s', start, event.summary);
//     }
//   }
//   console.log("====== DONE. static call to getEvents");
// })

function getOauth2Client(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  return new auth.OAuth2(clientId, clientSecret, redirectUrl);
}

function getExistingToken(callback) {
  fs.readFile(TOKEN_PATH, function(err, tokenStr) {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(tokenStr));
    }
  });
}

function refactoredGet() {
  oauth2Client = getOauth2Client(appSecret);

  getExistingToken(function (err, token){
    if (err) {
      console.log('Token DID not exist. EXIT.');
      process.exit(1);
      getNewToken(oauth2Client, "THIS, STILL IS NOT CALLED.")
    }

    console.log('=> got token:', token);
    oauth2Client.credentials = token;
    function f (err, events){
      if (events.length == 0) {
        console.log('No upcoming events found.');
      } else {
        console.log('Upcoming 10 events:');
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          var start = event.start.dateTime || event.start.date;
          console.log('%s - %s', start, event.summary);
        }
      }
    }
    listEvents(new Date(), f, oauth2Client);
  })

}

refactoredGet();

module.exports.getEvents = getEvents;
module.exports.getExistingToken = getExistingToken;
//module.exports.getNewToken = getNewToken;
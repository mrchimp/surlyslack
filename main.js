var Botkit = require('botkit');
var Surly = require('./surly2/src/Surly.js');
var controller = Botkit.slackbot();
var config = require('./config.json');
var mainbot = controller.spawn({
    token: config.token
});
var surly = new Surly({
    brain: config.brain
});

controller.hears(['food'], ['direct_message', "direct_mention", "mention"], function (bot, message) {
    var options = config.food_options;
    var selection = options[Math.floor(Math.random()*options.length)];

    console.log('Asking about food. Chose ' + selection);

    bot.reply(message, 'Who\'s up for ' + selection + '?');
});

controller.hears([".*"], ["direct_message", "direct_mention", "mention"], function (bot, message) {
    console.log('Got message: ' + message.text);

    surly.talk(function (err, response) {
        bot.reply(message, response);
    }, message.text);
});

mainbot.startRTM(function(err, bot, payload) {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

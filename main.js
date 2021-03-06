"use strict";

const config = require('./config.json');
const Botkit = require('botkit');
const Surly = require('surly2');
const controller = Botkit.slackbot();
const markovchain = require('markovchain');
const util = require('util');
const fs = require('fs');

const markov_file = __dirname + '/markovdata/data.txt';

var mainbot = controller.spawn({
    token: config.token
});

var surly = new Surly({
    brain: config.brain
});

var markov = new markovchain(fs.readFileSync(markov_file, 'utf8'));

/**
 * Add capital letters, full stops, etc.
 */
var normaliseInput = function (input) {
  var sentences = input.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|");

  for (var i = 0; i < sentences.length; i++) {
    sentences[i] = sentences[i].trim();
    sentences[i] = sentences[i][0].toUpperCase() + sentences[i].slice(1);

    if (!endsWithPunctuation(sentences[i])) {
      sentences[i] = sentences[i] + '.';
    }
  }
  return sentences.join(' ');
};

/**
 * Start markov chains with letters that have a capital letter.
 */
var startWithCaps = function (wordList) {
  var tmpList = Object.keys(wordList).filter(function(word) {
    return word[0] >= 'A' && word[0] <= 'Z';
  });

  return tmpList[~~(Math.random() * tmpList.length)];
};

/**
 * Returns true if sentence ends in correctly
 */
var endsWithPunctuation = function (sentence) {
  return ['.','!','?'].indexOf(sentence.substr(sentence.length-1)) !== -1;
};

/**
 * Add some text input to the live markov chain and append it to the data file
 */
var addMarkovContent = function (input) {
  input = normaliseInput(input);

  fs.appendFile(markov_file, input, function (err) {
    if (err) {
      console.log('Failed to append markov data file.');
    }
  });

  markov.parse(input);
};

/**
 * Suggest a random venue for lunch
 */
var suggestFood = function (bot, message) {
    var options = config.food_options;
    var selection = options[Math.floor(Math.random()*options.length)];

    bot.reply(message, 'Who\'s up for ' + selection + '?');
};

/**
 * Take a sentence and generate a response.
 */
var talk = function (bot, message) {
    var start = config.start_with_caps ? startWithCaps : '';
    var stop = config.end_with_full_stop ? endsWithPunctuation : 10;

    surly.talk(message.text, function (err, response) {
        if (!err) {
          bot.reply(message, response);
        } else {
          var markov_response = markov.start(start).end(stop).process();

          if (!markov_response) {
            markov_response = 'I have nothing to say to that';
          }

          bot.reply(message, markov_response + '.');
        }
    });
};

/**
 * Take input and use it to teach the bot without responding.
 */
var listen = function (bot, message) {
  addMarkovContent(message.text);
};

/**
 * Give the number of words in the markov chain
 */
var count = function (bot, message) {
  var content = fs.readFileSync(markov_file, 'utf8');
  var count = content.split(' ').length;
  bot.reply(message, 'I have ' + count + ' words.');
};

controller.hears(['food'], ['direct_message', "direct_mention", "mention"], suggestFood)
  .hears(['count'], ['direct_message', 'direct_mention', 'mention'], count)
  .hears(["talk"], ["direct_message", "direct_mention", "mention"], talk)
  .hears(['.*'], ['ambient', 'direct_message'], listen);

mainbot.startRTM(function(err, bot, payload) {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

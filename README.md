# Surly2 Slack Integration #

This is just for fun. Doesn't work very well yet. Try again next time.


## Installation ##

1. `npm install`
2. Copy `config.json.example` to `config.json`.
3. Fill in `config.json` with your data:
  * `token` should be your [Slack Bot API](https://api.slack.com/bot-users) token.
  * `brain` should be a path to a directory containing `.aiml` files.
  * `food_options` should be an array of places to eat.
  * `markov_brain` should be the path to a text file


## Usage ##

Stick some AIML files in your `brain` directory to add logic to the [Surly2](https://github.com/mrchimp/surly2) interpreter.

If someone says "food" either directly to Surly or as a mention, Surly will respond with a random item from `food_options`.

If someone says anything else directly to Surly or as a mention, Surly will attempt to respond using the Surly2 interpreter. If no response is found, a response will be created using a Markov chain generated from `markov_brain`.

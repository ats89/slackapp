const twitter = require('./apis/twitter');
const slack = require('./apis/slack');

module.exports = (app) => {

  // GET request to root 
  app.get('/', (req, res) => {
    res.send(`Root path hit: ${req.url}`);
  });

  // GET request to /oauth endpoint for handling Slack oAuth process
  app.get('/oauth', (req, res) => {
    // when user authorizes app, a code query param is passed on the oAuth endpoint
    if(!req.query.code) {
      res.status(500);
      res.send({ 'Error': 'Not getting query code.' });
      console.log('Not getting code.');
    } else {
      oAuthAccess(req, res);
    };
  });

  // Slash command '/get-tweets'
  app.post('/get-tweets', (req, res) => {
    const input = req.body.text;
    const responseUrl = req.body.response_url;

    if (twitter.isValidInput(input)) {
      const screenName = input.split(' ')[0];
      const count = input.split(' ')[1] || 1;

      res.send(`Getting the ${count > 1 ? `last *${count}* tweets ` : 'latest tweet'} on *@${screenName}*'s timeline:`);

      twitter.getTweets(screenName, count).then((response) => {
        twitter.postSlackTweets(responseUrl, response);
      }).catch((error) => {
        twitter.postSlackTweets(responseUrl, error);
      });
    } else {
      res.send("Invalid `/get-tweets` command! \n(Try `/get-tweets {user} {count (1-5, optional)}`)");
    };
  });

  // Slash command '/select-student' 
  app.post('/select-student', (req, res) => {
    const input = req.body.text;

    console.log(input);

    const response_url = req.body.response_url;   

    res.json({
      "response_type": "ephermeral", 
      "text": "Selecting a random student..."
    });

    slack.getUsersList(input).then((resp) => {
      slack.postSlackRandUser(response_url, resp);
    }).catch((err) => {
      console.log('getUsersList() error: ', err);
    });
  });
}

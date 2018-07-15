const request = require('request');

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
      console.log('Not getting code');
    } else {
      request({
        url: 'https://slack.com/api/oauth.access',        
        qs: { code: req.query.code, client_id: process.env.SLACK_CLIENT_ID, client_secret: process.env.SLACK_CLIENT_SECRET },
        method: 'GET',
      }, (err, resp, body) => {
        if (err) {
          console.log(error);
        } else {
          res.json(body);
        };
      })
    };
  });

  // Slash command endpoint (Slack sends a POST req)
  app.post('/woof', (req, res) => {
    // console.log(req.headers);
    // console.log(req.body);
    const response_url = req.body.response_url;
    console.log(response_url);

    // res.setHeader('Content-Type', 'application/json');
    res.send('hello world!');

    //setTimeout(function () { post_response(response_url) }, 3500);
  });


  // function post_response(response_url) {

  //   const oauthAccessToken = process.env.SLACK_OAUTH_TOKEN;
  //   const optionsAA = {
  //     url: 'https://slack.com/api/users.list',
  //     headers: {
  //       'Authorization': `Bearer ${oauthAccessToken}`
  //     }
  //   };

  //   request(optionsAA, function (error, response, body) {
  //     console.log('error:', error); // Print the error if one occurred
  //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //     console.log('body:', body); // Print the HTML for the Google homepage.
  //   });


  
  //   // Set up the options for the HTTP request.
  //   var options = {
  //       // Use the Webhook URL supplied by the slack request.
  //       url: response_url,
  //       method: 'POST',
  //       // Slack expects a JSON payload with a "text" property.
  //       json: { "response_type": "in_channel", "text": "Delayed response", "parse": "full" }
  //   };


  //   // Make the POST request to the Slack incoming webhook.
  //   request(options, function (error, response, body) {
  //       if (error) {
  //           console.log(error);
  //       } else {
  //           console.log("post OK");
  //       }
  //   })
  // }
}

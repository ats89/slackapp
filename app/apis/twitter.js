const Twitter = require('twitter');
const request = require('request');
const moment = require('moment');

const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

let formattedDate = (dateStr) => {
  const twitterDate = moment(dateStr, 'ddd MMM D HH:mm:ss Z YYYY');

  return twitterDate.format('ddd MMM D YYYY, h:mm a');
} 

let isValidInput = (inputString) => {
  const screenName = inputString.split(' ')[0];
  const count = inputString.split(' ')[1];

  if (screenName && count) {
    if (isNaN(count) || count < 1 || count > 5) {
      return false;
    } else {
      return true;
    };
  } else if (screenName && !count) {
    return true;
  } else {
    return false;
  };
}

let getTweets = (screenName, count) => {
  const params = {screen_name: screenName, count: count};

  return new Promise((resolve, reject) => {
    twitter.get('statuses/user_timeline', params, (error, tweets, response) => {
      let tweetsArray = [];
      
      if (!error) {
        for (let tweet of tweets) {
          tweetsArray.push({
            createdAt: formattedDate(tweet.created_at),
            text: tweet.text,
            user: tweet.user.screen_name,
            userProfileImgUrl: tweet.user.profile_image_url,
            retweetCount: tweet.retweet_count,
            favoriteCount: tweet.favorite_count
          });
        };
        resolve({tweets: tweetsArray});
      } else {
        resolve({error: 'Could not get tweets of specified user.'});
        //reject({error: 'Could not get tweets of specified user.'});
      };
    });
  });
}


let postSlackResponse = (responseUrl, response) => {
  let json;

  if (response.tweets) {
    let attachments = [];

    for (let tweet of response.tweets) {
      let jsonTweet = {
        "fallback": "tweet",
        "author_name": tweet.user,
        "author_icon": tweet.userProfileImgUrl,
        "text": tweet.text,
        "fields": [
          {
            "title": "Retweets",
            "value": tweet.retweetCount,
            "short": true
          }, 
          {
            "title": "Likes",
            "value": tweet.favoriteCount,
            "short": true
          }	
        ],
        "footer": tweet.createdAt
      };
      attachments.push(jsonTweet);
    };

    json = {
      "response_type": "ephemeral", 
      "attachments": attachments, 
    };
  } else {
    json = { 
      "response_type": "ephemeral", 
      "text": response.error, 
    };
  };

  const options = {
    url: responseUrl, // webhook url supplied by slack request
    method: 'POST',
    json: json
  };

  request(options, (err, resp, body) => {
    if (err) {
      console.log('error:', err);
    } else { 
      console.log('statusCode:', resp && resp.statusCode);
      console.log('body:', body); 
    };
  });
}

module.exports = {
  getTweets,
  isValidInput,
  postSlackResponse
};
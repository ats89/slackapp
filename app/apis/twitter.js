const Twitter = require('twitter');
const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

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
            createdAt: tweet.created_at,
            text: tweet.text,
            user: tweet.user.screen_name,
            userProfileImgUrl: tweet.user.profile_image_url,
            retweetCount: tweet.retweet_count,
            favoriteCount: tweet.favorite_count
          });
        };
        resolve({tweets: tweetsArray});
      } else {
        reject({error: 'Could not get tweets of specified user.'});
      };
    });
  });
}

module.exports = {
  getTweets,
  isValidInput
};
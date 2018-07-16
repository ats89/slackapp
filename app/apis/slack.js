const request = require('request');
const oauthAccessToken = process.env.SLACK_OAUTH_TOKEN;

/* Slack Config Require Scopes
getUsersList: users:read
getChannelsList: channels:read
postSlackMsgToUser: chat:write:bot
*/

let oauthAccess = (req, res) => {
  request({
    url: 'https://slack.com/api/oauth.access',        
    qs: { code: req.query.code, client_id: process.env.SLACK_CLIENT_ID, client_secret: process.env.SLACK_CLIENT_SECRET },
    method: 'GET',
  }, (err, resp, body) => {
    if (err) {
      console.log('oauthAccess() error: ', err);
    } else {
      res.json(body);
    };
  });
};

let getUsersList = (input) => {
  const options = {
    url: 'https://slack.com/api/users.list',
    headers: {
      'Authorization': `Bearer ${oauthAccessToken}`
    }
  };

  return new Promise((resolve, reject) => {
    const command = input.split(' ')[0];
    let excludeArr = [];

    if (command === 'exclude') {
      excludeArr = input.match(/<(.*?)>/g).map((e) => {
        return e.substring(0, e.indexOf('|')).replace(/[<@]/g, '');
      });
    };

    request(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        const users = JSON.parse(body).members;
        let userIds = [];
        
        for (let user of users) {
          if (user.real_name !== 'slackbot' && user.real_name && excludeArr.indexOf(user.id) < 0) {
            userIds.push(user.id);
          };
        };
        // resolve: array of userIds
        resolve(userIds);
      };
    });
  });
};

let getChannelsList = () => {
  const options = {
    url: 'https://slack.com/api/channels.list',
    headers: {
      'Authorization': `Bearer ${oauthAccessToken}`
    }
  };

  return new Promise((resolve, reject) => { 
    request(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        // resolve: array of channel objects
        resolve(JSON.parse(body).channels);
      }; 
    });
  });
}

let getChannelId = (channels, channelName) => {
  for (let channel of channels) {
    if (channel.name === channelName) {
      return channel.id;
    };
  };
}

let postSlackRandUser = (responseUrl, response) => {
  const userIds = response;
  const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
  
  const options = {
    url: responseUrl,
    method: 'POST',
    json: {
      "response_type": "in_channel", 
      "text": `<@${randomUserId}> has been randomly selected!`
    }
  };

  request(options, (err, resp, body) => {
    if (err) {
      console.log('postSlackRandUser() error: ', err);
    } else { 
      console.log('postSlackRandUser() success');
      
      getChannelsList().then((resp) => {
        console.log('getChannelsList() success');
        
        const channelId = getChannelId(resp, 'class-activities');

        if (channelId) {
          postSlackMsgToUser(randomUserId, channelId)
        };
      }).catch((err) => {
        console.log('getChannelsList() error: ', err);
      });
    };
  });
}

let postSlackMsgToUser = (userId, channelId) => {
  const options = {
    url: 'https://slack.com/api/chat.postEphemeral',
    qs: { channel: channelId, user: userId, text: 'You are the chosen one!' },
    headers: {
      'Authorization': `Bearer ${oauthAccessToken}`
    }
  };

  request(options, (err, resp, body) => {
    if (err) {
      console.log('postSlackMsgToUser() error:', err);
    } else { 
      console.log('postSlackMsgToUser() success');
    };
  });
} 

module.exports = {
  oauthAccess,
  getUsersList,
  postSlackRandUser
}
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

  // Slash command '/git-help'
  app.post('/git-help', (req, res) => {
    const input = req.body.text;
    const response_url = req.body.response_url;
    const attachments = [
      {
        "fallback": "git help 1",
        "color": "#de3C4b",
        "text": "```git status # view state of repo\ngit add <some_file> # stage a file\ngit add . / git add -A # add all changed files to staging area\ngit commit -m “...”\ngit stash #saves local commits and reverts working directory\n git stash apply #restores saved commits and applies them to current branch```",
        "mrkdwn_in": ["text"]
      },
      {
        "fallback": "git help 2",
        "color": "#390099",
        "text": "```git branch # list branches, show current branch (*)\ngit checkout master # switch to master\ngit checkout <branch_name> # switch to branch_name\ngit checkout -b <new_branch> # create and switch to new_branch```",
        "mrkdwn_in": ["text"]
      },
      {
        "fallback": "git help 3",
        "color": "#65Def1",
        "text": "```git push origin <my-branch> # push branch to remote repo\ngit pull origin <my-branch> # pull latest changes from branch (might be necessary if other people worked on branch)\ngit pull origin master # pull latest changes from master\n# then, -> fix conflicts -> push branch -> pull request -> review -> merge on GitHub (since we set master to be protected)\ngit branch -d <my-branch> # delete branch after it is merged; -D to force the delete```",
        "mrkdwn_in": ["text"]
      },
      {
        "fallback": "git help 4",
        "color": "#c4f7a1",
        "text": "```git branch -r # see list of remote branches (other people’s branches that have been pushed)\ngit fetch -p # keep local repo in sync with deleted remote branches (branches deleted on Github won’t show when running git branch -r)\ngit checkout <remote-branch> # make remote branch a local branch to work on (work on someone else’s branch)```",
        "mrkdwn_in": ["text"]
      },
    ];

    if (input === 'channel') {
      res.json({
        "response_type": "in_channel",
        "attachments": attachments, 
      });
    } else {
      res.json({
        "response_type": "ephermeral", 
        "attachments": attachments, 
      });
    }
  });
}

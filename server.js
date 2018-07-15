// set up =====

require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 4390;
const bodyParser = require('body-parser'); // pull info from HTML POST (express4)

// configuration =====

// parse application/x-www-form-urlencoded, application/json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// routes =====
require('./app/routes.js')(app);

// listen (start app with node server.js) =====
app.listen(port, () => {
  console.log(`App listening on port ${PORT}`);
});
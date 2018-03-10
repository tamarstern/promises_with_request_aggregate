
var express = require('express');
var bodyParser = require('body-parser');
var controller = require('./controller/requestAggregator');
var app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));


var router = express.Router();

router.route('/aggregate')
  .get(controller.getAggregator);


// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(3000);


module.exports = app; 
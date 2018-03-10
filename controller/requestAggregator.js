var Promise = require('bluebird');
var request = require('request');
var config = require('config');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });

var execReqWithPromise = function()
{
     return new Promise((resolve, reject) => {
        request(config.RequestServer, function (error, response, body) {          
            if(error) {
                return reject(error);
            } else if (response.statusCode == 500) {
                return reject(new Error("received 500 while executing http request"));
            } else {
                var bodyJson = JSON.parse(body);
                var num = bodyJson.randomNumber;        
                return resolve(num);
            }          
        });
    });
}

exports.getAggregator = async function(req, res) {
    var numReqReceived = req.query.numOfRequests;
    if (!numReqReceived) {
        res.status(422);
        return res.json({ message: "no numReqReceived" });
    }
    var numOfRequests = parseInt(numReqReceived);
    var aggregatedRes = 0;
    var tasks = [];
    for(var i =0 ; i < numOfRequests; i++) {
        tasks.push(execReqWithPromise());
    }
    Promise.all(tasks.map(task => task.catch(e => {
        logger.error('error while executing request ' + e);
        return 0;
    }))).then(function(values) {
        for(var j = 0 ; j < values.length; j++) {
            aggregatedRes += values[j];
    
        }
        var returnedValue = (aggregatedRes/numOfRequests);
        res.send({message : "request average returned", data : returnedValue});
      });
    
  };

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
var nock = require('nock');
 
let should = chai.should();

chai.use(chaiHttp);

describe('Test', () => {
  
  describe('/GET aggregate, server return no errors', () => {
      it('it should GET aggregate, server return no errors', (done) => {

          nock('http://localhost:3030').get('/api').times(3).reply(200, { randomNumber: 1 });

          var numOfRequests = 3;
          var urlParams = "numOfRequests=" +  numOfRequests;
          var completeUrl = '/api/aggregate?' + urlParams;
          chai.request(server)
            .get(completeUrl)
            .end((err, res) => {
                res.should.have.status(200);                  
                res.body.should.be.a('object');
                res.body.should.have.property('data').eql(1);
                done();
            });
      });
  });

  describe('/GET aggregate, last of 3 requests to server fail', () => {
    it('it should GET aggregate, last of 3 requests to server fail', (done) => {
        
        var numOfRequests = 3;
        var numOfSuccessfullRequests = 2;
        nock('http://localhost:3030').get('/api').times(numOfSuccessfullRequests).reply(200, { randomNumber: 1 });
        nock('http://localhost:3030').get('/api').times(numOfRequests - numOfSuccessfullRequests).reply(500, { error: "we have an error" });

        var urlParams = "numOfRequests=" +  numOfRequests;
        var completeUrl = '/api/aggregate?' + urlParams;
        chai.request(server)
          .get(completeUrl)
          .end((err, res) => {
              res.should.have.status(200);                  
              res.body.should.be.a('object');
              var dataExpectedValue = numOfSuccessfullRequests / numOfRequests;
              res.body.should.have.property('data').eql(dataExpectedValue);
              done();
          });
    });
});

describe('/GET aggregate, middle of 3 requests to server fail', () => {
    it('it should GET aggregate, middle of 3 requests to server fail', (done) => {
        
        var numOfRequests = 3;
        var numOfSuccessfullRequests = 2;
        nock('http://localhost:3030').get('/api').times(1).reply(200, { randomNumber: 1 });
        nock('http://localhost:3030').get('/api').times(1).reply(500, { error: "we have an error" });
        nock('http://localhost:3030').get('/api').times(1).reply(200, { randomNumber: 1 });

        var urlParams = "numOfRequests=" +  numOfRequests;
        var completeUrl = '/api/aggregate?' + urlParams;
        chai.request(server)
          .get(completeUrl)
          .end((err, res) => {
              res.should.have.status(200);                  
              res.body.should.be.a('object');
              var dataExpectedValue = numOfSuccessfullRequests / numOfRequests;
              res.body.should.have.property('data').eql(dataExpectedValue);
              done();
          });
    });
});


describe('/GET aggregate, first of 3 requests to server fail', () => {
    it('it should GET aggregate, first of 3 requests to server fail', (done) => {
        
        var numOfRequests = 3;
        var numOfSuccessfullRequests = 2;
       
        nock('http://localhost:3030').get('/api').times(1).reply(500, { error: "we have an error" });
        nock('http://localhost:3030').get('/api').times(2).reply(200, { randomNumber: 1 });

        var urlParams = "numOfRequests=" +  numOfRequests;
        var completeUrl = '/api/aggregate?' + urlParams;
        chai.request(server)
          .get(completeUrl)
          .end((err, res) => {
              res.should.have.status(200);                  
              res.body.should.be.a('object');
              var dataExpectedValue = numOfSuccessfullRequests / numOfRequests;
              res.body.should.have.property('data').eql(dataExpectedValue);
              done();
          });
    });
});


  describe('/GET aggregate no num of requests', () => {
    it('it should return 422', (done) => {
        var numOfRequests = 3;
        var completeUrl = '/api/aggregate';
        chai.request(server)
          .get(completeUrl)
          .end((err, res) => {
              res.should.have.status(422);                  
              done();
          });
    });
});


});

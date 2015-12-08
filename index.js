require("./node_modules/newrelic/newrelic.js");

var bodyParser = require("./node_modules/body-parser/index.js");
var express = require("./node_modules/express/index.js");

app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/', function(request, response, body) {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/json');

  var params = Object.keys(request.body)[0];
  params = JSON.parse(params);
  if (!params.hasOwnProperty('domain') || !params.hasOwnProperty('type')) {
    response.status(404).end(JSON.stringify({'status':'ERROR', 'description':'Domain and Type are mandatory parameters.'}));
  } else {
  var dns = require("./node_modules/native-dns/dns.js");
  dns.Request({
    question: dns.Question({
      name: params.domain,
      type: params.type
    }),
    server: {"address":"8.8.8.8","port":"53","type":"udp"},
    timeout: 2000
  }).on('timeout', function() {
    response.status(500).end(JSON.stringify({'status':'ERROR','description':'Timeout in fetching DNS info.'}));
  }).on('message', function(err, res) {
    if (err !== null && err !== undefined) {
      response.status(500).end(JSON.stringify({'status':'ERROR', 'description':'Couldn\'t process your request.'}));
    } else {

    var records = [];
    for(var i = 0; i < res.answer.length; i++) {
      var record = res.answer[i];
      var newRecord = {
        "name" : record.name,
        "type" : params.type,
        "ttl"  : record.ttl
      };
      
      if (params.type.toUpperCase() === "MX") newRecord["priority"] = record.priority;
      
      switch (params.type.toUpperCase()) {
        case "MX":
          newRecord["address"] = record.exchange;
          break;
        case "A":
          newRecord["address"] = record.address;
          break;
        case "TXT":
        case "NS":
          newRecord["address"] = record.data;
          break;
      }
      
      records[records.length] = newRecord;
      }
    }

    response.status(200).end(JSON.stringify({'status':'OK', 'records':records}));
  }).send();
  }
});

app.get('/', function(request, response, body) {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/plain');

  var fs = require('fs');
  fs.readFile('README', 'utf8', function(err, data) {
    if (err !== null && err !== undefined) {
      console.log(err);
      response.status(500).end(JSON.stringify({'status':'ERROR','description':'Couldn\'t process your request.'}));
    }
    var returnStr = data;
    returnStr += "\n\n" + JSON.stringify({"status": "ALIVE"});

    response.end(returnStr);
  });
});

/****************************************************************************/
/* HEALTH CHECK */
/****************************************************************************/
app.get("/status", function(request, response, body){
  response.status(200).send(JSON.stringify({"status":"OK", "method":"POST"}));
});

app.post("/status", function(request, response, body){
  response.status(200).send(JSON.stringify({"status":"OK", "method":"GET"}));
});

/*****************************************************************************/
/* WHOIS */
/*****************************************************************************/

app.post("/whois", function(request, response, body){
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/json');

  var params = Object.keys(request.body)[0];
  params = JSON.parse(params);
  if (!params.hasOwnProperty('domain')) {
    response.status(404).end(JSON.stringify({'status':'ERROR', 'description':'Domain is a mandatory parameter.'}));
  }

  var whoisUx = require("./node_modules/whois-ux/whois.js");
  var whois = require("./node_modules/node-whois/index.js");
  var whoisJson = require("./node_modules/whois-json/index.js");
  var unirest = require("./node_modules/unirest/index.js");
  //whois.lookup(params.domain, function(err, data){
  //whoisUx.whois(params.domain, function(err, data){
  //whoisJson(params.domain, function(err, data){
  /*
    if (err !== null && err !== undefined) {
      console.log(err);
      response.end(JSON.stringify({'status':'ERROR','description':'Couldn\'t process your request.'}));
    }
    response.end(JSON.stringify({'status':'OK', 'records':data}));
  });
  */

  unirest.get('https://jsonwhois.com/api/v1/whois')
   .headers({
     'Accept': 'application/json',
     'Authorization': 'Token token=621b737bd95a4c1b0946a5b63f75d41b'
   })
   .query({
     "domain": params.domain
   })
   .end(function(jsonWhoisResponse){
     console.log(jsonWhoisResponse.body);
     response.status(200).end(JSON.stringify({'status':'OK', 'records':jsonWhoisResponse.body.nameservers}));
   });
});

app.listen(3000);

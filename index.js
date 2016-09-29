// digdigjoydigjoypopoy
// Do you know the $ dig? So, we do the same, but with HTTP sequests.
// Curitiba, Brazil
// Author: Eduardo Quagliato <eduardo@quagliato.me>

var bodyParser = require("body-parser");
var express = require("express");

// Get yours in http://jsonwhois.doc
var JSON_WHOIS_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/****************************************************************************/
/* HEALTH CHECK */
/****************************************************************************/
app.get("/status", function(request, response, body){
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/json');
  response.status(200).send(JSON.stringify({"status":"OK", "method":"POST"}));
});

app.post("/status", function(request, response, body){
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/json');
  response.status(200).send(JSON.stringify({"status":"OK", "method":"GET"}));
});

/***************************************************************************/
/* GET PAGE */
/***************************************************************************/

app.get('/', function(request, response, body) {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/html');

  var fs = require('fs');
  fs.readFile('README.html', 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      response.status(500).end(JSON.stringify({"status":"ERROR","description":"Couldn't process your request."}));
    } else {
      response.end(data);
    }
  });
});

/**************************************************************************/
/* DIG */
/**************************************************************************/

app.post('/', function(request, response, body) {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Content-Type', 'text/json');

  var params = Object.keys(request.body)[0];
  params = JSON.parse(params);
  if (!params.hasOwnProperty('domain') || !params.hasOwnProperty('type')) {
    response.status(404).end(JSON.stringify({"status":"ERROR", "description":"Domain and Type are mandatory parameters."}));
  } else {
  var dns = require("native-dns");
  dns.Request({
    question: dns.Question({
      name: params.domain,
      type: params.type
    }),
    server: {"address":"8.8.8.8","port":"53","type":"udp"},
    timeout: 2000
  }).on('timeout', function() {
    response.status(500).end(JSON.stringify({"status":"ERROR", "description":"Timeout in fetching DNS info."}));
  }).on('message', function(err, res) {
    if (err !== null && err !== undefined) {
      response.status(500).end(JSON.stringify({"status":"ERROR", "description":"Couldn't process your request."}));
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

    response.status(200).end(JSON.stringify({"status":"OK", "records":records}));
  }).send();
  }
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
    response.status(404).end(JSON.stringify({"status":"ERROR", "description":"Domain is a mandatory parameter."}));
  }

  var unirest = require("unirest");

  unirest.get('https://jsonwhois.com/api/v1/whois')
   .headers({
     'Accept': 'application/json',
     'Authorization': 'Token token=' + JSON_WHOIS_KEY
   })
   .query({
     "domain": params.domain
   })
   .end(function(jsonWhoisResponse){
     console.log(jsonWhoisResponse.body);
     response.status(200).end(JSON.stringify({"status":"OK", "records":jsonWhoisResponse.body.nameservers}));
   });
});

app.listen(3000);

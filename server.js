// digdigjoydigjoypopoy
// Do you know the $ dig? So, we do the same, but with HTTP sequests.
// Curitiba, Brazil
// Author: Eduardo Quagliato <eduardo@quagliato.me>

const bodyParser = require('body-parser')
const dns = require('native-dns')
const express = require('express')
const fs = require('fs')
const unirest = require('unirest')

// Get yours in http://jsonwhois.com
const JSON_WHOIS_KEY = process.env.JSON_WHOIS_KEY || null

app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

/****************************************************************************/
/* HEALTH CHECK */
/****************************************************************************/
app.all('/status', (request, response, body) => {
  response.set('Access-Control-Allow-Origin', '*')
  response.set('Content-Type', 'text/json')
  response.status(200).send(JSON.stringify({
    status: 'OK',
    method: 'POST'
  }))
})

/***************************************************************************/
/* GET PAGE */
/***************************************************************************/
app.get('/', (request, response, body) => {
  response.set('Access-Control-Allow-Origin', '*')
  response.set('Content-Type', 'text/html')

  fs.readFile('README.html', 'utf8', (err, data) => {
    if (err) {
      console.log(err)
      response.status(500).end(JSON.stringify({
        status: 'ERROR',
        description: 'Couldn\'t process your request.'
      }))
      return
    }
    
    response.end(data)
  })
})

/**************************************************************************/
/* DIG */
/**************************************************************************/

app.get('/dig', (request, response, body) => {
  response.set('Access-Control-Allow-Origin', '*')
  response.set('Content-Type', 'text/json')

  if (!request.query.domain || !request.query.type) {
    response.status(404).end(JSON.stringify({
      status: 'ERROR',
      description: 'Domain and Type are mandatory parameters.'
    }))

    return
  }

  dns.Request({
    question: dns.Question({
      name: request.query.domain,
      type: request.query.type
    }),
    server: {
      address: '8.8.8.8',
      port: 53,
      type: 'udp'
    },
    timeout: 2000
  }).on('timeout', () => {
    return response.status(500).end(JSON.stringify({
      status: 'ERROR',
      description: 'Timeout in fetching DNS info.'
    }))
  }).on('message', (err, res) => {
    if (err) {
      return response.status(500).end(JSON.stringify({
        status: 'ERROR',
        description: 'Couldn\'t process your request.'
      }))
    }

    const records = []
    for(let i = 0; i < res.answer.length; i++) {
      const record = res.answer[i]
      const newRecord = {
        "name" : record.name,
        "type" : request.query.type,
        "ttl"  : record.ttl
      }
      
      if (request.query.type.toUpperCase() === "MX") newRecord["priority"] = record.priority
      
      switch (request.query.type.toUpperCase()) {
        case "MX":
          newRecord["address"] = record.exchange
          break
        case "A":
          newRecord["address"] = record.address
          break
        case "TXT":
        case "NS":
          newRecord["address"] = record.data
          break
      }
      
      records.push(newRecord);
    }

    response.status(200).end(JSON.stringify({
      status: 'OK',
      records: records
    }));
  }).send()
})

/*****************************************************************************/
/* WHOIS */
/*****************************************************************************/

app.get('/whois', (request, response, body) => {
  response.set('Access-Control-Allow-Origin', '*')
  response.set('Content-Type', 'text/json')

  if (!request.query.domain) {
    response.status(404).end(JSON.stringify({ 
      status: 'ERROR',
      description: 'Domain is a mandatory parameter.'
    }));

    return
  }

  if (JSON_WHOIS_KEY === null) {
    console.log('No JSON_WHOIS_KEY setted in the environment.')
    process.exit(1)
  }

  unirest.get('https://jsonwhois.com/api/v1/whois')
   .headers({
     'Accept': 'application/json',
     'Authorization': `Token token=${JSON_WHOIS_KEY}`
   })
   .query({
     'domain': request.query.domain
   })
   .end((jsonWhoisResponse) => {
     console.log(jsonWhoisResponse.body)
     response.status(200).end(JSON.stringify({
       status: 'OK',
       records: jsonWhoisResponse.body.nameservers
     }))
   })
})

const port = process.env.PORT || 3000

app.listen(port)


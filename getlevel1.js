const WebSocket = require('ws');

var connection = new WebSocket('wss://api.flowbtc.com.br/WSGateway')
connection.onopen = function() {
  const payload = {
    "OMSId": 1,
    "InstrumentId": 11,
  }

  const frame = {
    'm': 0,
    'i': 2,
    'n': 'subscribelevel1',
    'o': JSON.stringify(payload)
  }

  connection.send(JSON.stringify(frame))
};
connection.onerror = function(error) { console.error('error!!', error) };
connection.onmessage = function(msg) 
{
  const str=JSON.parse(msg.data)['o'];
  const ghh=JSON.parse(str);
  console.log(ghh);
};

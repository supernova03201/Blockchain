const WebSocket = require('ws');

var connection = new WebSocket('wss://api.flowbtc.com.br/WSGateway')
connection.onopen = function() {
  const payload = {
    "OMSId": 1,
    "InstrumentId": 16,
    "Depth":  50
  }

  const frame = {
    'm': 0,
    'i': 2,
    'n': 'SubscribeLevel2',
    'o': JSON.stringify(payload)
  }

  connection.send(JSON.stringify(frame))
};
connection.onerror = function(error) { console.error('error!!', error) };
connection.onmessage = function(msg) { console.log(JSON.parse(msg.data)['o']) };

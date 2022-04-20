

var BidArray, OfferArray, Tradable,Imbalance;
var BidQuantity, OfferQuantity;
var PriceArray = new Array();
var isConnected = 0;
setInterval(connectBid,3000);
setInterval(connectOffer,3000);
function connectBid()
{

    console.log("connectBid");
    var connectionBid = new WebSocket('wss://api.flowbtc.com.br/WSGateway')
    connectionBid.onopen = async function() {
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
        connectionBid.send(JSON.stringify(frame));
    };
    connectionBid.onerror = function(error) { console.error('error!!', error) };
    connectionBid.onmessage = function(msg) 
    {
        if(isConnected ==0 ) PriceArray = [];
        console.log("Bid Array Received");
        console.log(msg.data);
        BidArray = new Array();
        const Bid = JSON.parse(JSON.parse(msg.data)['o']);
        for(let i = 0 ; i < Bid.length ; i++)
        {
            BidArray.push(Bid[i]);
            PriceArray.push(Bid[i][6]);
        }
        BidArray.sort(function(a,b) { return b[6] - a[6]; })
        
        document.getElementById("BUYING").innerHTML = "";
    
        BidArray.forEach((c) => {
            document.getElementById("BUYING").innerHTML+="<tr>" +
            "<th>" + c[6] + "</th>" +
            "<th>" + c[8] + "</th>" +
            "</tr>";
        });
        isConnected ++ ;
        connectionBid.close();
        /* connectBid and connectOffer Success*/
        if(isConnected == 2)
        {
            isConnected = 0;
            GetQuantity();
        }
    };
}
    

function connectOffer()
{
    console.log("connectOffer");
    var connectionOffer = new WebSocket('wss://api.flowbtc.com.br/WSGateway');
    connectionOffer.onopen = function() {
        console.log("ONOPEN");
        const payload = {
            "OMSId": 1,
            "InstrumentId": 17,
            "Depth":  50
        }

        const frame = {
            'm': 0,
            'i': 2,
            'n': 'SubscribeLevel2',
            'o': JSON.stringify(payload)
        }

        connectionOffer.send(JSON.stringify(frame))
    };
    connectionOffer.onerror = function(error) { console.error('error!!', error) };
    connectionOffer.onmessage = function(msg) 
    {
        console.log("Offer Array Received");
        console.log(msg.data);

        if(isConnected ==0 ) PriceArray = [];       
        OfferArray = new Array();
        const Offer = JSON.parse(JSON.parse(msg.data)['o']);
        for(let i = 0 ; i < Offer.length ; i++)
        {
            OfferArray.push(Offer[i]);
            PriceArray.push(Offer[i][6]);
        }
        OfferArray.sort(function(a,b) { return a[6] - b[6]; })
        document.getElementById("SELLING").innerHTML = "";
        OfferArray.forEach((c) => {
            document.getElementById("SELLING").innerHTML+="<tr>" +
            "<th>" + c[6] + "</th>" +
            "<th>" + c[8] + "</th>" +
            "</tr>";
        });
        isConnected ++;        
        connectionOffer.close();
        if(isConnected == 2)
        {
            isConnected = 0;
            GetQuantity();
        }
    };
}
function GetQuantity()
{
    /*Remove duplicates from an array*/

    PriceArray = [...new Set(PriceArray)];


        BidQuantity = new Array(PriceArray.length).fill(0);
        OfferQuantity = new Array(PriceArray.length).fill(0);
        /* Step 2 */
        Tradable = new Array(PriceArray.length).fill(0);
        for(let i = 0 ; i < PriceArray.length; i++)
        {
            BidArray.forEach((c) => {
                
                if (PriceArray[i] <= c[6])
                {

                    BidQuantity[i] += c[8];
                } 
            });
            OfferArray.forEach((c) => {
                if (PriceArray[i] >= c[6])  OfferQuantity[i] += c[8];
            });
            Tradable[i] = BidQuantity[i] < OfferQuantity[i] ? BidQuantity[i] : OfferQuantity[i];
        }
        console.log("Tradable Array")
        console.log(Tradable);
        /*Step 3 */
        var maxTradable = Math.max(...Tradable) ,acutionPriceId = new Array();
        for(let i = 0 ; i < Tradable.length; i++)
        {
            if(maxTradable == Tradable[i])
                acutionPriceId.push(i);
        }
        document.getElementById('AuctionPrice').innerHTML = "AcutionPrice : ";
        document.getElementById('AuctionQuantity').innerHTML = "AcutionQuantity : ";
        
        if(acutionPriceId.length == 1)
        {
            document.getElementById('AuctionPrice').innerHTML += PriceArray[acutionPriceId[0]];
            document.getElementById('AuctionQuantity').innerHTML += Tradable[acutionPriceId[0]];
        }
        else /* There is a tie*/
        {
            console.log("There is a Tie")
            Imbalance = new Array(acutionPriceId.length);
            for(let i = 0 ; i < Imbalance.length ; i++)
                Imbalance[i] = Math.abs(BidQuantity[acutionPriceId[i]] - OfferQuantity[acutionPriceId[i]]);
            var minImbalnce = Math.min(...Imbalance), minImbalnceId = new Array();
            for(let i = 0 ; i < Imbalance.length ; i++)
                if(minImbalnce == Imbalance[i])
                    minImbalnceId.push(i);
            if(minImbalnceId.length==1)        
            {
                document.getElementById('AuctionPrice').innerHTML += PriceArray[acutionPriceId[minImbalnceId[0]]];
                document.getElementById('AuctionQuantity').innerHTML += Tradable[acutionPriceId[minImbalnceId[0]]];
            }
            else /* There is still a tie*/
            {
                /* Step 4*/
                console.log("There is still a tie");
                var connectionGetLevel = new WebSocket('wss://api.flowbtc.com.br/WSGateway')
                connectionGetLevel.onopen = function() {
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
                    
                    connectionGetLevel.send(JSON.stringify(frame))
                };
                connectionGetLevel.onmessage = function(msg) 
                {
                    const data = JSON.parse(msg.data)['o'];
                    const str = JSON.parse(data);
                    var LastTraded = str.LastTradedPx;
                    var minLastPrice = Math.abs(PriceArray[acutionPriceId[minImbalnceId[0]]] - LastTraded);
                    for(let i = 1 ; i < minImbalnceId.length ;  i++)
                        if(minLastPrice > Math.abs(PriceArray[acutionPriceId[minImbalnceId[i]]] - LastTraded))
                            minLastPrice = Math.abs(PriceArray[acutionPriceId[minImbalnceId[i]]] - LastTraded);
                    for(let i = 0; i < minImbalnceId.length ;  i++)
                        if(minLastPrice == Math.abs(PriceArray[acutionPriceId[minImbalnceId[i]]] - LastTraded))
                        {
                            document.getElementById('AuctionPrice').innerHTML += PriceArray[acutionPriceId[minImbalnceId[i]]];
                            document.getElementById('AuctionQuantity').innerHTML += Tradable[acutionPriceId[minImbalnceId[i]]];
                            isConnected = 0;
                            break;
                        }
                };

            }
        }
}
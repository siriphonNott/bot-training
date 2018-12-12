//--- Required Package ---
const express = require('express');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');
//------------------------

//------- Initial --------
const app = express();
const PORT = process.env.PORT ||  5000;
const client = new line.Client({
  channelAccessToken: '<channel access token>'
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//------------------------

//------- Route ----------
app.get('/', (req, res) => {
    res.send({status:'ok'})
    console.log('==> Get /')
});

app.post('/webhook', (req, res)=>{
    console.log('==> POST /webhook');
    console.log("==> body: ");
    console.log(req.body);

    //Check Empty object
    if(Object.keys(req.body).length !== 0) {
    
        let events = req.body.events;
        //--- Param -----
        let replyToken = events.replyToken;
        let type = events.type;
        //---------------

        switch (type) {
            //Event -> Text, Sticker, Picture
            case 'message':
                const message = {
                    type: 'text',
                    text: 'Nott Dev Krab ^^'
                };
                replyMessage(replyToken, message);
                break;

            //Event -> Add friend or unblock
            case 'follow':
                break;

            //Event -> unblock
            case 'unfollow':
                const message = {
                    type: 'text',
                    text: 'ลบเราออกทำไมหรอ Y_Y'
                };
                replyMessage(replyToken, message);
                break;
        
            default:
                break;
        }

        res.send({status:'ok'})
    } else {
        console.log("==> Bad Request (400) : body is empty!");
        res.status(400).send({errorMessage: 'body is empty!'});
    }
});
// ------------------------

// ------- Function -------
const replyMessage = (replyToken, message) => {
    client.replyMessage(replyToken, message)
        .then(() => {
            console.log(`==> Reply is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Reply is error: ${err}`);
        });
}

const pushMessage = (userId, message) => {
    client.pushMessage(userId, message)
        .then(() => {
            console.log(`==> Push is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Push is error: ${err}`);
        });
}
// ------------------------

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});


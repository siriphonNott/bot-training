//--- Required Package ---
const express = require('express');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');
//------------------------

//------- Initial --------
const app = express();
const PORT = process.env.PORT ||  5000;
const client = new line.Client({
  channelAccessToken: '67UQoneQDFAObETiUEGx5DH2dsZRComFPjjPCCrNghi/35LH9Q7lVwleXQj3XTFfDKhO9ggbKh4VDZXoqzX3d98xcxK/OZrSI4BYf5lGLzpQ+Og6OniOY1PTX7Yf22DAg8un4AH9b8poHrszPankKwdB04t89/1O/w1cDnyilFU='
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//------------------------


// ------- Function -------
const replyMessage = (replyToken, message) => {
    console.log(`==> replyMessage : ${replyToken}, msg: [${message}]`);
    client.replyMessage(replyToken, message)
        .then(() => {
            console.log(`==> Reply is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Reply is error: ${err}`);
        });
}

const pushMessage = (userId, message) => {
    console.log(`==> replyMessage : userId: [${userId}], msg: [${message}]`);
    client.pushMessage(userId, message)
        .then(() => {
            console.log(`==> Push is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Push is error: ${err}`);
        });
}
// ------------------------

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
        console.log('==> events');
        console.log(events);
        
        //--- Param -----
        let replyToken = events.replyToken;
        let type = events.type;
        //---------------
        const message = [];

        switch (type) {
            //Event -> Text, Sticker, Picture
            case 'message':
                message = {
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
                message = {
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

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});


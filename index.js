//--- Required Package ---
const express = require('express');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');
const firebase =  require('firebase-admin');
const axios =  require('axios');
const _ = require("lodash")
//------------------------

//------- Initial --------
const app = express();
var dataFirebase = {};
const PORT = process.env.PORT ||  5000;
const client = new line.Client({
    channelAccessToken: '67UQoneQDFAObETiUEGx5DH2dsZRComFPjjPCCrNghi/35LH9Q7lVwleXQj3XTFfDKhO9ggbKh4VDZXoqzX3d98xcxK/OZrSI4BYf5lGLzpQ+Og6OniOY1PTX7Yf22DAg8un4AH9b8poHrszPankKwdB04t89/1O/w1cDnyilFU='
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
const serviceAccount = require('./config/nottdev-training-firebase-adminsdk-rxndk-06bdedecfc.json');
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://nottdev-training.firebaseio.com"
});
firebase.database().ref('/kb/').once('value')
.then( (snapshot) => {
    console.log('Get Firebase');
    dataFirebase = snapshot.val();
});
//------------------------

//------ on listen -------
firebase.database().ref('/kb/').on('value', (snapshot)=>{
    console.log('Update Firebase');
    dataFirebase = snapshot.val();
});
//------------------------

// ------- Function -------
const getDataSite = (content = '', site = '') => {
    let url = '';
    return new Promise( (resolve, reject) => {
        if(type=='' && site=='') {
            url = '/kb/';
        } else {
            url = `/kb/${site}/${content}`;
        }
        firebase.database().ref(url).once('value')
        .then( (snapshot) => {
            console.log(`==> Get Data: Site: [${site}], Content: [${content}]`);
            return ( Object.keys(snapshot.val()).length != 0 )?snapshot.val():'';
        });
    });
}

const replyMessage = (replyToken, message) => {
    console.log(`==> replyMessage : replyToken:[${replyToken}], msg: [${message}]`);
    client.replyMessage(replyToken, message)
        .then(() => {
            console.log(`==> Reply is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Reply is error: ${err}`);
        });
}

const pushMessage = (userId, message) => {
    console.log(`==> pushMessage : userId: [${userId}], msg: [${message}]`);
    client.pushMessage(userId, message)
        .then(() => {
            console.log(`==> Push is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Push is error: ${err}`);
        });
}
// ------------------------

const test1 =  (resolve, reject) => {
    return new Promise((resolve, reject ) => {
        return resolve('fn1');
        
    });
}
const test2 =  (resolve, reject) => {
    return new Promise((resolve, reject ) => {
        // return resolve('fn2');
        return reject('error: fn2');
    });
}
const test3 =  (resolve, reject) => {
    return new Promise((resolve, reject ) => {
        return resolve('fn3');
    });
}

const main = async () => {

    const prices = [
        '1,000,000',
        '999',
        '38,900',
        '64,111'
      ]
      
      prices.forEach(price => console.log(price.padStart(10)))
     

    // test1()
    // .then((result1)=>{
    //     console.log(result1);
    //     return test2();
    // })
    // .then((result2)=>{
    //     console.log(result2);
    //     return test3();
    // })
    // .then((result3)=>{
    //     console.log(result3);
    // })
    // .catch((error)=>{
    //     console.log(error);
    // })
    try {
        const result1 = await test1()
        const result2 = await test2()
        const result3 = await test3()

        console.log('result1: '+result1);
        console.log('result2: '+result2);
        console.log('result2: '+result3);
        
    } catch (error) {
        console.log(error);
    }
}


// main()

//------- Route ----------
app.get('/', (req, res) => {
    res.send({status:'In service'})
    console.log('==> Get /')
    console.log(req.params);
    console.log(req.query);
    
    // if(Object.keys(req.params).length) {
    //     console.log('ok');
    // } else {
    //     throw {status:'not good'};
    // }
   
});

app.post('/webhook', (req, res)=>{
    console.log('==> POST /webhook');
    console.log("==> body: ");
    console.log(req.body);

    //Check Empty object
    if(Object.keys(req.body).length !== 0) {
    
        let events = req.body.events[0];
        console.log('==> events');
        console.log(events);
        
        //--- Param -----
        let replyToken = events.replyToken;
        let type = events.type;
        //---------------
        let message = [];

        switch (type) {
            //Event -> Text, Sticker, Picture
            case 'message':
               let messageText = events.message.text;
               let messageType = events.message.type;
               let messageId = events.message.id;

               switch (messageType) {
                   case 'text':
                        let command = messageText.split(' ');
                        if(messageText !== '' && command.length >= 2){
                            let firstCommand = command[0];
                            let secondCommand = command[1] || '';
                            switch (firstCommand) {
                                case 'list site':
                                    break;
                                case 'config':
                                    break;
                                case 'contact':
                                    break;
                                case 'list':
                                    break;
                                default:
                                    break;
                            }
                        } else {

                        }
                        break;
                   case 'sticker':
                        break;
                   case 'image':
                       break;
                   default:
                       break;
               }
                message = {
                    type: 'text',
                    text: 'Nott Dev Krab ^^'
                };
                // replyMessage(replyToken, message);
                break;
 
            //Event -> any user join group 
            case 'memberJoined':
                console.log(`==> [Member Joined]`);
                let joinedMembers = events.joined.members;
                console.log(joinedMembers);
                break;

            //Event -> any user left group 
            case 'memberLeft':
                console.log(`==> [Member Left]`);
                let leftMembers = events.left.members;
                console.log(leftMembers);
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


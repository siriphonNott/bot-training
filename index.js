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
const database = firebase.database();
//------------------------

//------ on listen -------
firebase.database().ref('/users/').on('value', (snapshot)=>{
    console.log('Firebase have Update');
    dataFirebase = snapshot.val();
});
//------------------------

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

app.post('/webhook', async (req, res)=>{
    console.log('==> POST /webhook');
    console.log("==> body: ");
    console.log(req.body);

    //Check Empty object
    if(Object.keys(req.body).length !== 0) {
        let jsonBody = {};
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
               let messageType = events.message.type;

               switch (messageType) {
                   case 'text':
                        stampMessage(events.source, events.message, events.timestamp)
                        break;
                   case 'sticker':
                        break;
                   case 'image':
                       break;
                   default:
                       break;
               }
                // replyMessage(replyToken, message);
                break;
 
            //Event -> any user join group 
            case 'memberJoined':
                console.log(`==> [Member Joined]`);
                let joinedMembers = events.joined.members[0];
                console.log(joinedMembers);
                database.ref(`users/${joinedMembers.userId}`).once('value').then(function(snapshot) {
                    if(snapshot.val() == null) {
                        jsonBody.createdAt = events.timestamp;
                        jsonBody.updatedAt = events.timestamp;
                        jsonBody.follow = '';
                        jsonBody.createdBy = 'memberJoined';
                        jsonBody.replyToken = '';
                        jsonBody.name = '';
        
                        database.ref(`users/${joinedMembers.userId}`).set(jsonBody, function(error) {
                            if (error) {
                            console.log('add fail: '+error);
                            } else {
                            console.log('add successfully');
                            }
                        });

                        getProfile(joinedMembers.userId)
                        .then((profile) => {
                            console.log(profile);
                            database.ref(`users/${joinedMembers.userId}/profile`).set(profile, function(error) {
                                if (error) {
                                    console.log('==> [Add profile fail]: '+error);
                                } else {
                                    console.log('==> [Add profile successfully]');
                                }
                            });
                        })
                        .catch((err) => {
                            console.log('getProfile is error: ');
                            console.log(err.Error);
                        });
                    } 
                });
                //Stamp to db
                break;

            //Event -> any user left group 
            case 'memberLeft':
                console.log(`==> [Member Left]`);
                let leftMembers = events.left.members;
                console.log(leftMembers);
                break;

            //Event -> Bot join to the group
            case 'join':
                if(events.source.type == 'group') {
                    let groupId = events.source.groupId;
                    let joinAt = events.source.timestamp;
                    //add group to db
                }
                break;

            //Event -> Bot leave from the group
            case 'leave':
                if(events.source.type == 'group') {
                    let groupId = events.source.groupId;
                    let leaveAt = events.source.timestamp;
                    //add group to db
                }
                break;

            //Event -> Add friend
            case 'follow':
                console.log(`==> [Follow]`);
                database.ref(`users/${events.source.userId}`).once('value').then(function(snapshot) {
                    if(snapshot.val() == null) {
                        jsonBody.createdAt = events.timestamp;
                        jsonBody.updatedAt = events.timestamp;
                        jsonBody.follow = events.type;
                        jsonBody.createdBy = events.type;
                        jsonBody.replyToken = '';
                        jsonBody.name = '';
        
                        database.ref(`users/${events.source.userId}`).set(jsonBody, function(error) {
                            if (error) {
                            console.log('add fail: '+error);
                            } else {
                            console.log('add successfully');
                            }
                        });

                        getProfile(events.source.userId)
                        .then((profile) => {
                            console.log(profile);
                            database.ref(`users/${events.source.userId}/profile`).set(profile, function(error) {
                                if (error) {
                                    console.log('==> [Add profile fail]: '+error);
                                } else {
                                    console.log('==> [Add profile successfully]');
                                }
                            });
                        })
                        .catch((err) => {
                            console.log('getProfile is error: ');
                            console.log(err.Error);
                        });
                    } else {
                        var updates = {};
                        updates[`users/${id}/follow`] = events.type;
                        updates[`users/${id}/updatedAt`] = events.timestamp;
                        database.ref().update(updates);
                        console.log('update successfully');
                    }
                });
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

// ------- Function -------
const getUserInfo = (userId = null) => {
    return new Promise( (resolve, reject) => {
        database.ref(`users/${userId}`).once('value').then(function(snapshot) {
            let result = snapshot.val();
            if(result == null) {
                reject('userId not found');
            } else {
                resolve(result);
            }
        });

    });
}

const getProfile = (userId) => {
    console.log('==> [Get Profile]: userId => '+userId);
    return new Promise((resolve, reject) => {
        client.getProfile(userId)
        .then(function (profile) {
            console.log('[Get Profile]: successfully!');
            // console.log(profile);
            resolve(profile)
        })
        .catch(function (error) {
            console.log('[Get Profile]: Error');
            console.log(error);
            reject(error);
        });
    });
}

const stampMessage = (source  = null, message = null, timestamp = null) => {
    console.log(`==> [Stamp Message]`);
    if (source || messageId) {
        console.log('source and message is empty!');
        return false
    } else {
        let jsonBody = {}
        jsonBody.source = source
        jsonBody.message = message
        jsonBody.timestamp = timestamp
        console.log(`[jsonBody]`);
        console.log(jsonBody);
        
        let targetType = `${source.type}s`;
        let targetId = (targetType == 'group')?source.groupId:source.userId

        console.log('targetType: '+targetType);
        console.log('targetId: '+targetId);

        database.ref(`chatBotMessages/${targetType}/${targetId}/messages/${today}/${message.id}`).set(jsonBody, function(error) {
            if (error) {
            console.log('add fail: '+error);
            } else {
            console.log('add successfully');
            }
        });
    }

}

const replyMessage = (replyToken, message) => {
    console.log(`==> replyMessage : replyToken:[${replyToken}], message: [${message}]`);
    client.replyMessage(replyToken, message)
        .then(() => {
            console.log(`==> Reply is successfully!`);
        })
        .catch((err) => {
            console.log(`==> Reply is error: ${err}`);
        });
}

const pushMessage = (userId, message) => {
    console.log(`==> pushMessage : userId: [${userId}], message: [${message}]`);
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


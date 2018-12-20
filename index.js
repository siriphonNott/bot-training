//--- Required Package ---
const express = require('express');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');
const firebase =  require('firebase-admin');
const axios =  require('axios');
const _ = require("lodash")
const _moment = require("moment")
const moment = _moment().utcOffset('+07:00');
//------------------------

//------- Initial --------
const app = express();
const PORT = process.env.PORT ||  5000;
const client = new line.Client({
    channelAccessToken: 'TtiT0Sy/z9J0RPpMTPQJmJbsdM7ZpFkXfB1Dp1p+kF1+biFAmGeCUpD2iyTEFDoQwQi5WYGXz0rkb3ZDpiWslu0B5zCzmX4faMlwpzRdVB9w+2ZvAsTc7MOqHcKONuPhEo3fCU0TcJH+qZT6g/XcQgdB04t89/1O/w1cDnyilFU='
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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//------- Route ----------
app.get('/', (req, res) => {
    res.send({status:'In service'})
    console.log('==> Get /')
    console.log(req.params);
    console.log(req.query);
});

//Set role
app.post('/role', (req, res) => {
    console.log('==> /role')
    let body = req.body;
    console.log('==> boby');
    console.log(body);
    if(Object.keys(body).length != 0) {
        let userId = body.userId;
        let role = body.role;
        let update = {
            role: role
        }
        database.ref(`users/${userId}`).set(update, function(error) {
            if (error) {
            console.log('add fail: '+error);
            } else {
            console.log('add successfully');
            }
        });
    } else {
        res.status(400).send({message: 'body is empty!'});
    }
});

//Case Reserve
app.post('/caseReserve', async (req, res) => { 
    console.log('==> /caseReserve')
    let body = req.body;
    console.log('==> boby');
    console.log(body);
    if(Object.keys(body).length != 0) {
        let messageId = body.messageId;
        let sourceType = body.sourceType;
        let isReserve = body.isReserve;
        let agentName = body.agentName;
        let targetType = `${sourceType}s`;
        let targetId = (sourceType == 'group')?body.groupId:body.userId
        let caseReserve = ''

        if(isReserve) {
            caseReserve = agentName
        }
        messagesKey = messageId.substring(0, 8);
       
        try {
            let updates = {};
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/caseReserve`] = caseReserve
            database.ref().update(updates);
            res.send({message: `success`});
        } catch (error) {
            res.status(400).send({message: `can't send message. `});
        }
    } else {
        res.status(400).send({message: 'body is empty!'});
    }
});

//Submit Case
app.post('/submitCase', async (req, res) => { 
    console.log('==> /submitCase')
    let body = req.body;
    console.log('==> boby');
    console.log(body);
    console.log(Object.keys(body).length);
    
    if(Object.keys(body).length != 0) {
        let messageId = body.messageId;
        let sourceType = body.sourceType;
        let agentName = body.agentName;
        let caseId = body.caseId;
        let targetType = `${sourceType}s`;
        let targetId = (sourceType == 'group')?body.groupId:body.userId

        let messagesKey = messageId.substring(0, 8);
       
        try {
            let updates = {};
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/caseRelated`] = caseId
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/caseOpenDate`] =  moment.valueOf();
            database.ref().update(updates);
            res.send({message: `success`});
        } catch (error) {
            res.status(400).send({message: `can't update message to firebase. `});
        }
    } else {
        console.log('==> body is empty!');
        res.status(400).send({message: 'body is empty!'});
    }
});

//Delete Message
app.post('/deleteMessage', async (req, res) => { 
    console.log('==> /deleteMessage')
    let body = req.body;
    console.log('==> boby');
    console.log(body);
    console.log(Object.keys(body).length);
    
    if(Object.keys(body).length != 0) {
        let messageId = body.messageId;
        let sourceType = body.sourceType;
        let agentName = body.agentName;
        let targetType = `${sourceType}s`;
        let targetId = (sourceType == 'group')?body.groupId:body.userId
        let messagesKey = messageId.substring(0, 8);
       
        try {
            let updates = {};
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/isDeleted`] = true
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/caseRelated`] = agentName
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/caseReserve`] = agentName
            updates[`chatBotMessages/${targetType}/${targetId}/messages/${messagesKey}/${messageId}/case/caseOpenDate`] =  moment.valueOf();
            database.ref().update(updates);
            res.send({message: `success`});
        } catch (error) {
            res.status(400).send({message: `can't update message to firebase. `});
        }
    } else {
        console.log('==> body is empty!');
        res.status(400).send({message: 'body is empty!'});
    }
});

//Stamp message
app.post('/postMessage', async (req, res) => {
    console.log('==> /postMessage')
    let body = req.body;
    console.log('==> boby');
    console.log(body);
    if(Object.keys(body).length != 0) {
        let message = body.message;
        let targetId = body.targetId;
        let type = body.type;
        let source = {
            groupId: targetId,
            action: 'bot'
        }

        if(type == 'group') {
            source.groupId = targetId
            source.type = 'group'
        } else  {
            source.userId = targetId
            source.type = 'user'
        }
        
        let messageBody = {
            text: message,
            type: 'text',
            id: moment.format('YYYYMMDDHHmmss')
        }
        try {
            stampMessage(source, messageBody)
            await pushMessage(targetId, message)
            res.send({message: `success`});
        } catch (error) {
            res.status(400).send({message: `can't send message. `});
        }
    } else {
        res.status(400).send({message: 'body is empty!'});
    }
});

app.post('/webhook', async (req, res) => {
    let dateLog = moment.format("YYYY-MM-DD HH:mm:ss")
    console.log(`Date: ${dateLog}`);
    
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
                        jsonBody.role = '';
                        jsonBody.name = 'N/A';
        
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
                        jsonBody.role = '';
                        jsonBody.name = 'N/A';
        
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
                        updates[`users/${events.source.userId}/follow`] = events.type;
                        updates[`users/${events.source.userId}/updatedAt`] = events.timestamp;
                        database.ref().update(updates);
                        
                        //Update Profile
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
                        console.log('update successfully');
                    }
                });
                break;

            //Event -> unblock
            case 'unfollow':
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

const stampMessage = (source  = {}, message = {}, timestamp = null) => {
    console.log(`==> [Stamp Message]`)
    timestamp  = timestamp || moment.valueOf()
    if (Object.keys(source).length == 0  ||  Object.keys(message).length == 0) {
        console.log('source or message  is empty!');
        return false
    } else {
        let jsonBody = {}
        let today = _moment().utcOffset('+07:00').format('YYYYMMDD')
        let messageId = _moment().utcOffset('+07:00').format('YYYYMMDDHHmmss')
        
        jsonBody.source = source
        jsonBody.message = message
        jsonBody.timestamp = timestamp
        jsonBody.duration = 0
        jsonBody.case = {
            caseRelated: '',
            caseOpenDate: '',
            caseReserve: '',
            isDeleted: false,
        }
        console.log(`[jsonBody]`);
        console.log(jsonBody);
        
        let targetType = `${source.type}s`;
        let targetId = (source.type == 'group')?source.groupId:source.userId

        database.ref(`chatBotMessages/${targetType}/${targetId}/messages/${today}/${messageId}`).set(jsonBody, function(error) {
            if (error) {
            console.log('==> Stamp fail: '+error);
            } else {
            console.log('==> Stamp successfully');
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
    let msg = {
        type: "text",
        text: message
    }
    return new Promise( (resolve, reject) => {
        client.pushMessage(userId, msg)
            .then(() => {
                console.log(`==> Push is successfully!`);
                return resolve(true);
            })
            .catch((err) => {
                console.log(`==> Push is error: ${err}`);
                return reject(false)
            });
    });
   
}
// ------------------------

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});


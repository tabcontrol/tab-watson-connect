"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var express = require('express');
var socket = require('socket.io');
var axios = require('axios');
const tabapi = require("./tabapi-helper");
const envVariables = require("./config");
var assistantV2 = require('ibm-watson/assistant/v2');
require('dotenv').config();
var PORT = process.env.PORT || 4000;
var IBMSessionId;
//comment
var pullmessageorg;
var sessionkey;
var affinity;
var sessionid;
var app = express();
var server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening to request on port ${PORT}`);
});
var conversation;
//Static Files
app.use(express.static('public'));
console.log('Received Init');
var { IamAuthenticator } = require('ibm-watson/auth');
//authenticate
const authenticator = new IamAuthenticator({
    apikey: 'FgosQhVf-JYUoF5KEb7lWPjTa_PXXcgMK_yIibqMA3Is'
});
//connect to assistant
const assistant = new assistantV2({
    version: '2020-09-13',
    authenticator: authenticator,
    url: 'https://api.au-syd.assistant.watson.cloud.ibm.com/instances/006d911f-d432-432c-93db-43cac692c2d8'
});
//Set up Socket.io
var io = socket(server);
io.on('connection', function (socket) {
    console.log(`Connection Established ${socket.id}`);
    conversation = [];
    socket.on('initMsg', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const sess = assistant.createSession({
                assistantId: 'cd1bbccf-b595-4337-8c4e-e018d9b23bd1'
            }).then(data => {
                IBMSessionId = data['result']['session_id'];
                console.log(`IBM Session Id is ${IBMSessionId}`);
                socket.emit('IBMSessId', IBMSessionId);
            })
                .catch(e => { console.log('Error'); console.log(e); });
        }
        catch (err) {
            console.log('Main err');
            console.log(err);
        }
    }));
    socket.on('botRequestMessage', (data) => __awaiter(this, void 0, void 0, function* () {
        console.log(IBMSessionId + '****');
        conversation.push('User: ' + data.message + '\n');
        socket.emit('U_chat', data.message);
        let payload = {
            assistantId: 'cd1bbccf-b595-4337-8c4e-e018d9b23bd1',
            sessionId: IBMSessionId,
            input: {
                message_type: 'text',
                text: data.message
            }
        };
        const message = yield assistant.message(payload);
        try {
            console.log('-----------');
            console.log(JSON.stringify(message));
            console.log(JSON.stringify(message));
            if (message.result.output.generic[0].response_type == 'text' && message.result.output.generic[0].response_type != 'option') {
                conversation.push('Bot: ' + message.result.output.generic[0].text + '\n');
                console.log(conversation);
                socket.emit('botResponse', message.result.output.generic[0].text);
            }
            else if (message.result.output.generic[0].response_type == 'option') {
                var opts = [];
                var labelContent = '';
                message.result.output.generic[0].options.forEach(item => { opts.push(item.label); labelContent += `\t ${item.label}`; });
                //conversation.push('Bot: ' + message.result.output.generic[0].text + '\n');
                conversation.push(`Options => ${labelContent} \n`);
                console.log(conversation);
                socket.emit('botResponse', message.result.output.generic[0].title);
                socket.emit('optns', opts);
                console.log(JSON.stringify(opts));
            }
            else if (message.result.output.generic[0].response_type == 'connect_to_agent') {
                socket.emit('transferResponse', 'Connecting you to Agent');
            }
        }
        catch (e) {
            console.log(e);
        }
    }));
    socket.on('U_chatData', (data) => __awaiter(this, void 0, void 0, function* () {
        console.log('user: ' + data.message);
        socket.emit('U_chat', data.message);
        let text = data.message;
        const sendMessage = yield tabapi.sendMessages(text, affinity, sessionkey);
        socket.emit('botResponse', message.result.output.generic[0].text);
        if (sendMessage !== "OK") {
            console.log("\n Error: Cannot Send Message \n");
            return;
        }
    }));
    socket.on('transcript', (data) => __awaiter(this, void 0, void 0, function* () {
        console.log('user: ' + data.message);
        //socket.emit('U_chat', data.message);
        let text = data.message;
        const sendMessage = yield tabapi.sendMessages(text, affinity, sessionkey);
        if (sendMessage !== "OK") {
            console.log("\n Error: Cannot Send Message \n");
            return;
        }
    }));
    socket.on('transfer', () => __awaiter(this, void 0, void 0, function* () {
        console.log(`TeNSFER TO Agent`);
        console.log(`Entereed`);
        const getAgentAvailability = yield tabapi.agentAvailability();
        console.log(getAgentAvailability);
        if (getAgentAvailability.success === true) {
            const getSessionId = yield tabapi.sessionId();
            console.log(getSessionId);
            if (getSessionId.success === true) {
                sessionkey = getSessionId.data.key;
                affinity = getSessionId.data.affinityToken;
                sessionid = getSessionId.data.id;
                const body = {
                    organizationId: process.env.CHAT_ORGANISATIONID || envVariables.CHAT_ORGANISATIONID,
                    deploymentId: process.env.CHAT_DEPLOYMENTID || envVariables.CHAT_DEPLOYMENTID,
                    buttonId: process.env.CHAT_BUTTONID || envVariables.CHAT_BUTTONID,
                    sessionId: sessionid,
                    userAgent: "Lynx/2.8.8",
                    language: "en-US",
                    screenResolution: "1900x1080",
                    visitorName: "Ms. Jasmine Tay***",
                    prechatDetails: [{
                            "label": "LastName",
                            "value": "Tay***",
                            "entityMaps": [{
                                    "entityName": "contact",
                                    "fieldName": "LastName"
                                }],
                            "transcriptFields": [
                                "LastName__c"
                            ],
                            "displayToAgent": true
                        },
                        {
                            "label": "FirstName",
                            "value": "Jasmine",
                            "entityMaps": [{
                                    "entityName": "contact",
                                    "fieldName": "FirstName"
                                }],
                            "transcriptFields": [
                                "FirstName__c"
                            ],
                            "displayToAgent": true
                        },
                        {
                            "label": "Email",
                            "value": "lxysfdcdemo@gmail.com",
                            "entityMaps": [{
                                    "entityName": "contact",
                                    "fieldName": "Email"
                                }],
                            "transcriptFields": [
                                "Email__c"
                            ],
                            "displayToAgent": true
                        }
                    ],
                    prechatEntities: [{
                            "entityName": "Contact",
                            "saveToTranscript": "contact",
                            "linkToEntityField": "ContactId",
                            "entityFieldsMaps": [{
                                    "fieldName": "LastName",
                                    "label": "LastName",
                                    "doFind": true,
                                    "isExactMatch": true,
                                    "doCreate": true
                                },
                                {
                                    "fieldName": "FirstName",
                                    "label": "FirstName",
                                    "doFind": true,
                                    "isExactMatch": true,
                                    "doCreate": true
                                },
                                {
                                    "fieldName": "Email",
                                    "label": "Email",
                                    "doFind": true,
                                    "isExactMatch": true,
                                    "doCreate": true
                                }
                            ]
                        }],
                    receiveQueueUpdates: true,
                    isPost: true,
                };
                const sendingChatRequest = yield tabapi.sendingChatRequest(body, affinity, sessionkey);
                if (sendingChatRequest === true) {
                    console.log("\n Chat Session Initiated Successfully.");
                    pullmessageorg = yield tabapi.pullingMessages(affinity, sessionkey);
                    console.log('******');
                    console.log(JSON.stringify(pullmessageorg));
                    console.log('******');
                    while (pullmessageorg.messages[0].type != "ChatEnded") {
                        if (pullmessageorg.messages[0].type === "ChatRequestSuccess") {
                            io.sockets.emit('A_chat', ` Waiting for agent to accept your request.\n Your are in position 1`);
                            console.log("\n Waiting for agent to accept your request.");
                        }
                        if (pullmessageorg.messages[0].type === "ChatEstablished") {
                            io.sockets.emit('A_chat', 'Agent Accepted');
                            console.log("\n Agent Accepted your request.");
                            io.sockets.emit('A_chat', `\n ${pullmessageorg.messages[0].message.name} is here to help you. Should be joining you any second now.`);
                            let text = '';
                            conversation.forEach(item => {
                                if (conversation.length == 1)
                                    text = item;
                                else
                                    text += item + '\n';
                            });
                            console.log('text');
                            console.log(text);
                            const sendMessage = yield tabapi.sendMessages(text, affinity, sessionkey);
                            if (sendMessage !== "OK") {
                                console.log("\n Error: Cannot Send Message \n");
                                return;
                            }
                        }
                        if (pullmessageorg.messages[0].type === "ChatMessage") {
                            console.log("\n" + pullmessageorg.messages[0].message.name +
                                " : " +
                                pullmessageorg.messages[0].message.text +
                                "\n");
                            io.sockets.emit('A_chatText', "\n" + pullmessageorg.messages[0].message.name +
                                " : " +
                                pullmessageorg.messages[0].message.text +
                                "\n");
                        }
                        const pullingMessagesAgain = yield tabapi.pullingMessages(affinity, sessionkey);
                        pullmessageorg = pullingMessagesAgain;
                    }
                    io.sockets.emit('A_chat_End', ' Chat Ended. Agent Left The Chat.');
                    console.log("\n Chat Ended. Agent left the Chat. \n");
                    return;
                }
                else {
                    console.log("\n Error: Sending Chat Request Failed \n");
                    return;
                }
            }
            else {
                console.log("\n Error: Cannot Get Session Id \n");
                return;
            }
        }
        else {
            console.log("\n No Agents are Online. Please try back later \n");
            io.sockets.emit('A_chat', '\n No Agents are Online. Please try back later \n');
            // return;
        }
    }));
});

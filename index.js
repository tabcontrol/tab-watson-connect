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
var sessionKey;
var token;
var affinity;
var sessionid;
var agent = {}
var app = express();
var server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening to request on port ${PORT}`);
});
var conversation;
//Static Files
app.use(express.static('public'))
console.log('Received Init');
var {
    IamAuthenticator
} = require('ibm-watson/auth');
//authenticate
const authenticator = new IamAuthenticator({
    apikey: 'FgosQhVf-JYUoF5KEb7lWPjTa_PXXcgMK_yIibqMA3Is'
})
//connect to assistant
const assistant = new assistantV2({
    version: '2020-09-13',
    authenticator: authenticator,
    url: 'https://api.au-syd.assistant.watson.cloud.ibm.com/instances/006d911f-d432-432c-93db-43cac692c2d8'
})

//Set up Socket.io
var io = socket(server);


async function onEventMessage(events) {
    console.log('******');
    console.log(JSON.stringify(events));
    console.log('******');

    if( (events != null) ){
        if( Array.isArray(events) ){
            events.forEach((event) => processEvent(event));
        }
        else {
            processEvent(events);
        }
    }
}

async function processEvent(event) {
    if (event.eventType == "CHAT_FINISHED") {
        io.sockets.emit('A_chat_End', ' Chat Ended. Agent Left The Chat.');
        console.log("\n Chat Ended. Agent left the Chat. \n");

    } else if (event.eventType === "CHAT_QUEUED") {
        io.sockets.emit('A_chat', ` Waiting for agent to accept your request.\n Your are in position ${event.positionInQueue}. Estimated time: ${event.minutesLeft} minute(s)`);
        console.log(
            "\n Waiting for agent to accept your request."
        );

        extraContacts = [{id: 'watson', name: '223'},]

        const sendHistory = await tabapi.sendHistory(
            token,
            sessionKey,
            extraContacts,
            conversations
        );
        if (sendHistory.success === false) {
            console.log("\n Error: Cannot Send History \n");
            return;
        }
    } else if (event.eventType === "CHAT_JOINED") {
        agent = event.agent

    } else if (event.eventType === "CHAT_HANDLED") {
        io.sockets.emit('A_chat', 'Agent Accepted');
        console.log("\n Agent Accepted your request.");
        io.sockets.emit('A_chat', `\n <b>${agent.name}</b> is here to help you. Should be joining you any second now.`);

    } else if (event.eventType === "CHAT_MESSAGE") {
        console.log(
            "\n" + agent.name +
            " : " +
            event.message.text +
            "\n"
        );
        io.sockets.emit('A_chatText',
            "\n<b>" + agent.name +
            "</b> : " +
            event.message.text +
            "\n"
        );
    }
}

io.on('connection', function (socket) {
    console.log(`Connection Established ${socket.id}`);
    conversation = [];
    socket.on('initMsg', async () => {
        try {
            const sess = assistant.createSession({
                assistantId: 'cd1bbccf-b595-4337-8c4e-e018d9b23bd1'
            }).then(data => {
                IBMSessionId = data['result']['session_id'];
                console.log(`IBM Session Id is ${IBMSessionId}`);
                socket.emit('IBMSessId', IBMSessionId);
            })
                .catch(e => { console.log('Error'); console.log(e) });
        } catch (err) {
            console.log('Main err');
            console.log(err);
        }

    });


    socket.on('botRequestMessage', async (data) => {
        console.log(IBMSessionId + '****');
        conversation.push({'contactId': 'User01', 'message': {'text': data.message}});

        socket.emit('U_chat', data.message);
        let payload = {
            assistantId: 'cd1bbccf-b595-4337-8c4e-e018d9b23bd1',
            sessionId: IBMSessionId,
            input: {
                message_type: 'text',
                text: data.message
            }
        }
        const message = await assistant.message(payload);
        try {
            console.log('-----------');
            console.log(JSON.stringify(message));
            console.log('-----------');

            if (message.result.output.generic[0].response_type == 'text' && message.result.output.generic[0].response_type != 'option') {
                conversation.push('Bot: ' + message.result.output.generic[0].text + '\n');
                console.log(conversation);
                socket.emit('botResponse', message.result.output.generic[0].text);

            } else if (message.result.output.generic[0].response_type == 'option') {
                var opts = [];
                var labelContent = '';
                message.result.output.generic[0].options.forEach(item => { opts.push(item.label); labelContent += `\t ${item.label}` });
                //conversation.push('Bot: ' + message.result.output.generic[0].text + '\n');
                conversation.push(`Options => ${labelContent} \n`);
                console.log(conversation);
                socket.emit('botResponse', message.result.output.generic[0].title);
                socket.emit('optns', opts);
                console.log(JSON.stringify(opts));

            } else if (message.result.output.generic[0].response_type == 'connect_to_agent') {
                socket.emit('transferResponse', 'Connecting you to Agent');
            }
        } catch (e) {
            console.log(e)
        }
    });


    socket.on('U_chatData', async (data) => {
        console.log('user: ' + data.message);
        socket.emit('U_chat', data.message);
        let text = data.message;
        let contactId = 'jose.pereira'
        const sendMessage = await tabapi.sendMessage(
            token,
            sessionKey,
            contactId,
            text
        );
        //socket.emit('botResponse', message.result.output.generic[0].text);
        if (sendMessage.success === false) {
            console.log("\n Error: Cannot Send Message \n");
            return;
        }
    })

    socket.on('transfer', async () => {
        console.log(`TRANSFER TO Agent`);

        const login = await tabapi.login();
        console.log(login);

        if (login.success === false) {
            io.sockets.emit('A_chat', '\n System are down. Please try back later \n');
            return;
        }
        token = login.data.token;

        const getAgentAvailability = await tabapi.agentAvailability(token);
        console.log(getAgentAvailability);

        if (getAgentAvailability.success === false) {
            io.sockets.emit('A_chat', '\n No Agents are Online. Please try back later \n');
            return
        }

        const initSession = await tabapi.initSession(token);
        console.log(initSession);

        if (initSession.success === false) {
            console.log("\n Error: Cannot Get Session Id \n");
            io.sockets.emit('A_chat', '\n System are down. Please try back later \n');
            return;
        }

        sessionKey = initSession.data.sessionKey;

        const subs = tabapi.subscribeSession(sessionKey, onEventMessage)
        if (initSession.success === false) {
            io.sockets.emit('A_chat', '\n System are down. Please try back later \n');
            return;
        }

        const headers = {
            userAgent: "Lynx/2.8.8",
            language: "en-US",
            screenResolution: "1900x1080"
        }
        const contact = {
            id: 'jose.pereira',
            name: 'José Carlos Pereira',
            displayName: 'José Carlos',
            email: 'jose.pereira@grupoultra.com',
            phone: '3199993131'
        };

        const startRequest = await tabapi.startRequest(
            token,
            sessionKey,
            contact, 
            headers
        );

        if (startRequest === true) {
            console.log(
                "\n Chat Session Initiated Successfully."
            );
        } else {
            console.log("\n Error: Sending Chat Request Failed \n");
            return;
        }
    })

});
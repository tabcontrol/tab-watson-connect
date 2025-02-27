"use strict";
// Server URL Environment Variable
const SERVER_URL = process.env.SERVER_URL;
console.log(SERVER_URL + '****');
// REST API Endpoints
module.exports = {
    sessionid: `${SERVER_URL}System/SessionId`,
    chatrequest: `${SERVER_URL}Chasitor/ChasitorInit`,
    pullingmessages: `${SERVER_URL}System/Messages`,
    sendingmessages: `${SERVER_URL}Chasitor/ChatMessage`,
    stopchat: `${SERVER_URL}Chasitor/ChatEnd`,
    availability: `${SERVER_URL}Visitor/Availability`,
};

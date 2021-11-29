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
const axios = require("axios");
const apiEndpoints = require("./endpoints");
const agentAvailability = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios
        .get(apiEndpoints.availability, {
        headers: {
            "X-LIVEAGENT-API-VERSION": 49,
        },
        params: {
            'Availability.ids': process.env.CHAT_BUTTONID,
            'deployment_id': process.env.CHAT_DEPLOYMENTID,
            'org_id': process.env.CHAT_ORGANISATIONID,
            'Availability.needEstimatedWaitTime': 1
        }
    })
        .then((res) => res.data)
        .then((res) => {
        if (res.messages[0].message.results[0].isAvailable)
            return {
                success: true,
                data: res,
            };
        else
            return {
                success: false,
            };
    })
        .catch(() => {
        console.log('Established Session err');
        return {
            success: false,
        };
    });
});
const sessionId = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios
        .get(apiEndpoints.sessionid, {
        headers: {
            "X-LIVEAGENT-API-VERSION": 49,
            "X-LIVEAGENT-AFFINITY": "null",
        },
    })
        .then((res) => res.data)
        .then((res) => {
        console.log('Established Session');
        return {
            success: true,
            data: res,
        };
    })
        .catch(() => {
        return {
            success: false,
        };
    });
});
const sendingChatRequest = (body, affinity, sessionkey) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios
        .post(apiEndpoints.chatrequest, body, {
        headers: {
            "X-LIVEAGENT-API-VERSION": 49,
            "X-LIVEAGENT-AFFINITY": affinity,
            "X-LIVEAGENT-SESSION-KEY": sessionkey,
            "X-LIVEAGENT-SEQUENCE": 1,
        },
    })
        .then((res) => { res.data; })
        .then(() => {
        return true;
    })
        .catch((err) => {
        console.log(err);
    });
});
const pullingMessages = (affinity, sessionkey) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios
        .get(apiEndpoints.pullingmessages, {
        headers: {
            "X-LIVEAGENT-API-VERSION": 49,
            "X-LIVEAGENT-AFFINITY": affinity,
            "X-LIVEAGENT-SESSION-KEY": sessionkey,
        },
    })
        .then((res) => res.data)
        .then((res) => {
        //console.log(res);
        return res;
    })
        .catch((err) => {
        console.log(err);
    });
});
const sendMessages = (text, affinity, sessionkey) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios
        .post(apiEndpoints.sendingmessages, {
        text: text,
    }, {
        headers: {
            "X-LIVEAGENT-API-VERSION": 49,
            "X-LIVEAGENT-AFFINITY": affinity,
            "X-LIVEAGENT-SESSION-KEY": sessionkey,
        },
    })
        .then((res) => res.data)
        .then((res) => {
        // console.log(res);
        return res;
    })
        .catch((err) => {
        console.log(err);
    });
});
const stopChat = (reason, affinity, sessionkey) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios
        .post(apiEndpoints.stopchat, {
        "reason": reason
    }, {
        headers: {
            "X-LIVEAGENT-API-VERSION": 49,
            "X-LIVEAGENT-AFFINITY": affinity,
            "X-LIVEAGENT-SESSION-KEY": sessionkey,
        },
    })
        .then((res) => res.data)
        .then((res) => {
        // console.log(res);
        return res;
    })
        .catch((err) => {
        console.log(err);
    });
});
module.exports.sessionId = sessionId;
module.exports.sendingChatRequest = sendingChatRequest;
module.exports.pullingMessages = pullingMessages;
module.exports.sendMessages = sendMessages;
module.exports.stopChat = stopChat;
module.exports.agentAvailability = agentAvailability;

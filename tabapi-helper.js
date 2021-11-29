const axios = require("axios");
const apiEndpoints = require("./endpoints");
const tabapi = require('./tabapi');

var connection = null;

const login = async () =>
  await connection
  .call('com.tabcontrol.api.access.login', {
    'apiId': process.env.CHAT_BUTTONID,
    'apiKey': process.env.CHAT_DEPLOYMENTID,
  })
  .then((res) => res)
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

const initSession = async (token) =>
  await connection
  .call('com.tabcontrol.api.chat.initSession', {
    token: token,
  })
  .then((res) => res)
  .then((res) => {
    console.log('Established Session');
    return {
      success: true,
      data: res,
    };
  })
  .catch(() => {
    console.log("\n Error: Init Session Failed \n");
    return {
      success: false,
    };
  });

const subscribeSession = async (sessionKey, subscribeHandler) =>
  await connection
  .subscribe(`com.tabcontrol.api.chat.session_event_${sessionKey}`, subscribeHandler)
  .then((res) => res)
  .then((res) => {
    console.log('Subscripted in Session events');
    return {
      success: true,
      data: res,
    };
  })
  .catch(() => {
    console.log("\n Error: Subscripted Session events Failed \n");
    return {
      success: false,
    };
  });

const agentAvailability = async (token) => 
  await connection
  .call('com.tabcontrol.api.chat.agentAvailability', {
    token: token,
    botId: process.env.CHAT_BUTTONID,
    queueId: process.env.CHAT_DEPLOYMENTID,
  })
  .then((res) => res)
  .then((res) => {
    if (res.isAvailable & res.estimatedWaitTime <= 2)
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



const startRequest = async (token, sessionKey, contact, headers) =>
  await connection
  .call('com.tabcontrol.api.chat.startRequest', {
    token: token,
    sessionKey: sessionKey,
    botId: process.env.CHAT_BUTTONID,
    queueId: process.env.CHAT_DEPLOYMENTID,
    contact: contact,
    headers: headers
  })
  .then((res) => {res})
  .then(() => {
    return true;
  })
  .catch((err) => {
    console.log(err);
  });


const userTyping = async (token, sessionKey, isTyping) =>
  await connection
  .call('com.tabcontrol.api.chat.userTyping', {
      token: token,
      sessionKey: sessionKey,
      isTyping: isTyping
    }
  )
  .then((res) => {
    if (res)
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
    return {
      success: false,
    };
  });

const sendMessage = async (token, sessionKey, contactId, text) =>
  await connection
  .call('com.tabcontrol.api.chat.sendMessage', {
      token: token,
      sessionKey: sessionKey,
      contactId: contactId,
      message: {text: text},
    }
  )
  .then((res) => {
    if (res)
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
    return {
      success: false,
    };
  });

const sendHistory = async (token, sessionKey, history) =>
  await connection
  .call('com.tabcontrol.api.chat.sendHistory', {
      token: token,
      sessionKey: sessionKey,
      history: history,
    }
  )
  .then((res) => {
    if (res)
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
    return {
      success: false,
    };
  });


const stopRequest = async (token, sessionKey, reason) =>
  await connection
  .call('com.tabcontrol.api.chat.stopRequest', {
    token: token,
    sessionKey: sessionKey,
    reason: reason
    }
  )
  .then((res) => res)
  .then((res) => {
    // console.log(res);
    return res;
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
    try {
        // Connect to TABAPI
        connection = await tabapi.connect('wss://devel.tabcontrol.com.br/ws');

    }
    catch (e) {
        console.log(e);
    }
}

main();  

module.exports.login = login;
module.exports.agentAvailability = agentAvailability;
module.exports.initSession = initSession;
module.exports.subscribeSession = subscribeSession;
module.exports.startRequest = startRequest;
module.exports.stopRequest = stopRequest;
module.exports.userTyping = userTyping;
module.exports.sendMessage = sendMessage;
module.exports.sendHistory = sendHistory;
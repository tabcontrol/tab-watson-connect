# IBM Watson-TABControl CHAT API-Connect
- This is a simple Javascript app built using TABControl Chat API that helps you communicate between IBM Watson and TCCX Agent.
- Heroku acts as the orchestrator.

## Prerequisits:

- TABControl Developer Account with CHAT API Setup.
- Heroku Account.
- IBM Watson Account

## Demo

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/xKrZFhv1MLF/0.jpg)](https://www.youtube.com/watch?v=xKrZFhv1MLF)


## Architecture

![alt text](<https://i.imgur.com/HGjNxBQ.png>)


## Installation:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/tabcontrol/tab-watson-connect/tree/main)

## Instructions:

Once done the deployment. Click Manage App and select Settings tab.

Scroll down to Config Vars Section Click Reveal Config Vars and crate config vars as below.

![alt text](<https://i.imgur.com/co88ccN.png>)

| Key | Value |
| --- | --- |
| CHAT_APIID | Api Chat Id |
| CHAT_APIKEY | Api Chat Key |
| CHAT_BOTID | Api Chat Bot Id |
| CHAT_QUEUEID | Api Chat Queue Id |
| SERVER_URL | Server TABControl Chat URL |
| WATSON_ASSISTANT_ID | IBM Watson Assistant Id |
| WATSON_ASSISTANT_KEY | IBM Watson Assistant Key |
| WATSON_ASSISTANT_URL | IBM Watson Assistant URL |


# Where do I get these Details
**TABControl**
- Server URL - Set up -> Search Chat setting. And you get the *Chat API Endpoint*

**IBM Watson** 
- Navigate to your Watson Assistant Skills page -> Click 3 dots on top right of your assistant-> Select View API Details.
From the pop up 

![alt text](<https://i.imgur.com/dixw4GV.png>)


| Watson Key | Heroku Key |
| --- | --- |
| Skill ID | IBM Watson Assistant Id |
| API key | IBM Watson Assistant Key |
| Legacy v1 workspace URL | IBM Watson Assistant URL (Note: consider the URL before _/v1/(Excluding)_) | 


![alt text](<https://i.imgur.com/1iFRiqT.png>)


- Open the app and test.

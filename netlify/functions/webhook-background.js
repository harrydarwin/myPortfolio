// require('dotenv').config()
// Firebase module imports
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Node+ module imports
const crypto = require('crypto');
const fetch = require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7qwhyKl9TjkEu6kIhJz-B7kduyPkHUzU",
    authDomain: "zoom-profile-builder.firebaseapp.com",
    projectId: "zoom-profile-builder",
    storageBucket: "zoom-profile-builder.appspot.com",
    messagingSenderId: "580713961006",
    appId: "1:580713961006:web:0019645ad132e5389ef1bf",
    measurementId: "G-TGC3L2ZFCX"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

//   initialize firestore database
  const db = getFirestore(app);


const promptsArray = [
  'Give me a full chronological sequence of the call and highlight the main talking points in a list format',
  'Based on the following conversation, build me a client profile broken down into categories',
  'Based on the following conversation, as a sales expert, build a client profile broken down into categories',
  'Based on the following conversation, as a sales expert, build a client profile broken down into bullet point style with headings  including, Demographic, Psychographic, Goals, Challenges, Pain Points, Potential Solutions and actionables.',
  `Based on the following conversation, please assist in building a comprehensive client profile of the client, not the host of the meeting. Organize your response under the following headings:

  Demographics: Basic information such as age, gender, occupation, location, etc.
  Psychographics: Lifestyle, behavior, interests, values, and buying motivations.
  Goals: Both short-term and long-term aspirations or targets the client wants to achieve.
  Challenges: Specific issues or obstacles the client is currently facing or expects to face.
  Pain Points: The specific problems or frustrations experienced by the client that our solution can potentially address.
  Potential Solutions: Suggested solutions or products that would fit the client's needs or help solve their problems.
  Actionables: Steps we can take immediately or in the near future to assist the client.
  Finally, please provide a concise summary of the client profile, capturing the most critical points for quick reference.`
];

const summaryPromptArray = [
  'As a business and sales specialist, summarize the following client profile information into a neat comprehensive client profile that Rob can use to understand his client completely at a glance: ',
  'As a business development and sales specialist, summarize these profile iterations the into a complete client profile while maintaining the original profile headings, please format it nicely and remove any repetition.'
];

const customPrompt = promptsArray[4];
let currentClientEmail;

exports.handler = async function (event, context) {
  console.log('Payload recieved!!!')
  console.log('EVENT: ', event)
  let response = {};
  const requestBody = event.body ? event.body : null;
  if (!requestBody) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid request body.' })
    };
  }
//   console.log('event TYPE: ', requestBody.event)
  // Only accept ROBS payloads + only transcript end events
  // if(requestBody.event !== 'recording.transcript_completed'){
  //   return;
  // }
//   console.log('EVENT BABY:', event);
  // console.log(requestBody.payload.object.host_id)

//   console.log('HEADERs', event.headers);
  console.log('Body ----->', requestBody);



  // Send an initial response indicating that the request has been received
  const initialResponse = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Request received. Processing in progress.' })
  };

  // Perform any necessary asynchronous processing in the background
  await processInBackground(requestBody);

  return initialResponse;
};

async function processInBackground(requestBody) {

    // const recordingFiles = requestBody.payload.object.recording_files;
    console.log('REQ BODY -in func ----->', requestBody)
    const stringConvoParts = [];
    let rawConversationString;
    console.log(requestBody);
    const meetingTopic = requestBody?.payload?.object?.topic
    let topicName = false;
    if(meetingTopic && meetingTopic.includes(' :')){
      topicName = meetingTopic.split(' : ')[0];
      console.log(topicName)
      // if this works, add the name to the porompt
    }
    try {
        console.log('Fetching file...')
        const vttText = await getVTTFileText(requestBody);
        // Process the VTT file text
        console.log('VTTtext--', vttText);
        rawConversationString = vttText;
        const convoParts = extractNamesAndDialogues(rawConversationString);
        console.log('convo-part---->', convoParts);
        const newClientProfile = await aiAnalyze(convoParts, customPrompt);

        // grab client name from conversation strings
        // const getNames = extractNamesWithoutRob(convoParts);
        // const clientName = getNames.join();
        // formattedClient = slugify(clientName);


        return newClientProfile
    } catch (error) {
        // Handle the error
        console.error('Error:', error);
        // Optionally, log the error or perform error handling
        return error
    }
};

function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace consecutive hyphens with a single hyphen
      .trim(); // Trim leading/trailing whitespace
}

// Janky function to grab Client name - only works with ROB as host as the name implies
function extractNamesWithoutRob(strings) {
    const names = strings.map((str) => {
      const match = str.match(/^(.*?):/);
      return match ? match[1].trim() : null;
    });

    const filteredNames = names.filter((name) => name && !name.includes('Rob'));

    return filteredNames;
}

async function processZoomInput(input) {
  return JSON.stringify(input);
}

async function getVTTFileText(url) {
    console.log('GRABBBBING', url)
  try {
    const response = await axios.get(url);
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Error fetching VTT file - URL:', url, 'Error:', error);
    throw error;
  }
}

// clean up text chat by removing excess clutter (date times and response numbers)
// Takes full convo -string- ATM
// Returns aray of objects
function extractNamesAndDialogues(conversation) {
  const nameRegex = /^[A-Za-z ]+:/;
  const lines = conversation.split('\n');
  const result = [];
  let convoParts = [];

  for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nameMatch = line.match(nameRegex);

      if (nameMatch) {
          const name = nameMatch[0].slice(0, -1);
          const dialogue = line.slice(name.length + 1).trim();
          result.push({ name, dialogue });
      }
  }
  // const fullConvoString = convertObjectToValuesArray(result).join("\n");
  // format massive array of objects into 1 array of strings
  const fullConvoArray = convertObjectToValuesArray(result);

  // split array into equal parts less then 8000 chars (token limit)
  convoParts = groupStrings(fullConvoArray);
  // convoParts = divideArrayIntoPieces(fullConvoArray, 3)
  console.log(convoParts);
  return convoParts;
}

function convertObjectToValuesArray(objArray) {
  // Create an empty array to store the result
  const result = [];

  // Iterate over the input array
  objArray.forEach(obj => {
    // Get an array of the values of the current object
    const valuesArray = Object.values(obj);

    // Add the values array to the result
    result.push(valuesArray.join(': '));
  });

  // Return the final result
  return result;
}




function groupStrings(strings) {
  const maxLength = 8000;
  const groups = [];
  let currentGroup = "";

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i];

    if (currentGroup.length + string.length > maxLength) {
      groups.push(currentGroup);
      currentGroup = "";
    }

    currentGroup += string;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  const targetLength = Math.ceil(groups.reduce((total, group) => total + group.length, 0) / groups.length);

  let currentLength = 0;
  let currentStrings = [];
  const result = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    if (currentLength + group.length > targetLength) {
      result.push(currentStrings);
      currentStrings = [];
      currentLength = 0;
    }

    currentStrings.push(group);
    currentLength += group.length;
  }

  if (currentStrings.length > 0) {
    result.push(currentStrings);
  }

  const outcomeArray = result.map((strings) => strings.join(""));
  if(outcomeArray[0] === ''){outcomeArray.shift()}
  return outcomeArray;
}

function extractNameFromString(inputString) {
    const regex = /Name:\s*(.*?)\s*\n/i;
    const match = inputString.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return 'NO_NAME';
}



// Sends text through the api and spits out the analyzed result
async function aiAnalyze(textInput, prompt) {
  console.log('AI-analyze text input ----', textInput);

  if (Array.isArray(textInput)) {
        console.log('RUNNING ARRAY LOGIC ----->')
        let api_key = process.env.GPT_API_KEY;
        let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}`
        };
        let prevResponseMessages = null;
        const compareGrowth = [];

        for (let i = 0; i < textInput.length; i++) {
        prompt = i > 0 ? "Using the following piece of the conversation, continue building the client profile, while maintaining the original headings, only adding things that help give a more accurate profile" : prompt;
        let data1 = {
            max_tokens: 597,
            model: 'gpt-3.5-turbo',
            "messages": [
            { "role": "user", "content": `${prompt}: ${textInput[i]}` }
            ]
        };

        if (prevResponseMessages !== null) {
            data1.messages.unshift(prevResponseMessages);
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data1)
        });

        const myResult = await response.json();
        console.log(myResult);
        console.log((i + 1) + '/' + textInput.length);
        prevResponseMessages = myResult.choices[0].message;
        compareGrowth.push(myResult.choices[0].message.content);
        }

        console.log('LETS FUCKING GO-- ', compareGrowth);

        let combinedOutputs = '';
        compareGrowth.forEach(output => {
        combinedOutputs += output + " \n\n";
        });

        console.log('COMBINED OUTPUTS--', combinedOutputs);
        await aiAnalyze(combinedOutputs, summaryPromptArray[1]);
    } else {
        console.log('Compiling profile data...');
        let api_key = process.env.GPT_API_KEY;
        let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}`
        };

        const data = {
        max_tokens: 597,
        model: 'gpt-3.5-turbo',
        "messages": [
            { "role": "user", "content": `${prompt}: ${textInput}` }
        ]
        };

        try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });

        const responseJson = await response.json();
        const clientProfile = responseJson.choices[0].message.content;
        console.log('<---------CLIENT PROFILE:', clientProfile);

        //   WRITE FILE
        // grab and format date to the second
        const currentDate = new Date();
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        };
        const clientName = extractNameFromString(clientProfile);
        const formattedClient = slugify(clientName);
        console.log(formattedClient)
        const formattedDate = currentDate.toLocaleString('en-US', options).replace(/[/:\s,]/g, '-');
        console.log(formattedDate);

            // Save the newClientProfile in a text file
        const fileName = `${formattedDate}_${formattedClient}`; // Replace with the desired file name
        // Send profile to firebase for storage
        try {
            const docRef = await setDoc(doc(db, "clientProfiles", fileName), {
                name: formattedClient,
                profile: clientProfile
              });
            // console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }

        return clientProfile;
        } catch (error) {
        let clientProfile = "Error loading your clients profile: " + error;
        console.log('<---------ERROR CLIENT PROFILE:', clientProfile);
        throw new Error(clientProfile);
        }
    }
}

// const getACClientID = () => {

// }

const updateACClientProfile = (contact, field, value) => {
  var settings = {
    "url": `https://marketplacesuperheroes1683647536.api-us1.com/api/3/fieldValues/${field}`,
    "method": "PUT",
    "timeout": 0,
    "headers": {
      "Api-Token": "dba68be9c867f2994a3eb5663d120b1f67d55814834c0d96e06b70348d6fa2ca1420e905",
      "Content-Type": "application/json",
      "Cookie": "PHPSESSID=cff22d8c4e0799f81a768d9a3ebd0dc9; em_acp_globalauth_cookie=dea0fa9f-c962-4057-961f-2ecdb1d0797c"
    },
    "data": JSON.stringify({
      "fieldValue": {
        "contact": contact,
        "field": field,
        "value": value
      },
      "useDefaults": false
    }),
  };

  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}
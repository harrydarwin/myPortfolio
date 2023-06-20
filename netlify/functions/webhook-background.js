// require('dotenv').config()
const axios = require('axios');
const crypto = require('crypto');
const fetch = require('isomorphic-fetch');

const promptsArray = [
  'Give me a full chronological sequence of the call and highlight the main talking points in a list format',
  'Based on the following conversation, build me a client profile broken down into categories',
  'Based on the following conversation, as a sales expert, build a client profile broken down into categories',
  'Based on the following conversation, as a sales expert, build a client profile broken down into bullet point style with headings  including, Demographic, Psychographic, Goals, Challenges, Pain Points, Potential Solutions and actionables.'
];

const summaryPromptArray = [
  'As a business and sales specialist, summarize the following client profile information into a neat comprehensive client profile that Rob can use to understand his client completely at a glance: ',
  'As a business development and sales specialist, summarize these profile iterations the into a complete client profile while maintaining the original profile headings, please format it nicely and remove any repetition.'
];

const customPrompt = promptsArray[3];

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
  processInBackground(requestBody);

  return initialResponse;
};

async function processInBackground(requestBody) {

    // const recordingFiles = requestBody.payload.object.recording_files;
    console.log('REQ BODY -in func ----->', requestBody)
    const stringConvoParts = [];
    let rawConversationString;
    console.log(selectedFileURL);
    try {
        console.log('Fetching file...')
        const vttText = await getVTTFileText(selectedFileURL);
        // Process the VTT file text
        console.log('VTTtext--', vttText);
        rawConversationString = vttText;
        const convoParts = extractNamesAndDialogues(rawConversationString);
        console.log('convo-part---->', convoParts);
        const newClientProfile = await aiAnalyze(convoParts, customPrompt);
        // console.log('--------NEW CLIENT PROFILE----->', newClientProfile);
        return newClientProfile
    } catch (error) {
        // Handle the error
        console.error('Error:', error);
        // Optionally, log the error or perform error handling
        return error
    }
};

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
    console.error('Error fetching VTT file:', error);
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
      let output = responseJson.choices[0].message.content;
      let clientProfile = output;
      console.log('<---------CLIENT PROFILE:', clientProfile);
      return clientProfile;
    } catch (error) {
      let clientProfile = "Error loading your clients profile: " + error;
      console.log('<---------ERROR CLIENT PROFILE:', clientProfile);
      throw new Error(clientProfile);
    }
  }
}

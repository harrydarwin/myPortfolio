require('dotenv').config()
const crypto = require('crypto');

exports.handler = async function (event, context) {
  console.log('EVENT BABY:', event);

  let response = {};
  const requestBody = event.body ? JSON.parse(event.body) : '';

  console.log('HEADERs', event.headers);
  console.log('Body', requestBody);

  // Only accept ROBS payloads + only transcript end events
  if(requestBody.event !== 'recording.transcript_completed' || requestBody.payload.object.host_id !== 'i50cPqx3R22xnUS0I6ZVOw'){
    return;
  }

  const message = `v0:${event.headers['x-zm-request-timestamp']}:${JSON.stringify(requestBody)}`;

  const hashForVerify = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex');

  const signature = `v0=${hashForVerify}`;

  if (event.headers['x-zm-signature'] === signature) {
    console.log("HEADER THING MATCHED");

    if (requestBody.event === 'endpoint.url_validation') {
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(requestBody.payload.plainToken).digest('hex');

      response = {
        statusCode: 200,
        body: JSON.stringify({
          plainToken: requestBody.payload.plainToken,
          encryptedToken: hashForValidate
        })
      };

      console.log(response.body);
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Authorized request to Zoom Webhook sample.' })
      };

      console.log('Response:', response.body);

      const thing = await processZoomInput(requestBody);
      const recordingFiles = requestBody.payload.object.recording_files

      if(Array.isArray(recordingFiles)){
        recordingFiles.forEach((file, i) => {
          console.log(`Recording file #${i}: `, file);
        })
      } else {
        console.log('RECORDING FILE: ', recordingFiles)
      }
      console.log(thing);

      // business logic here, example make API request to Zoom or 3rd party
    }
  } else {
    response = {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized request to Zoom Webhook sample.' })
    };

    console.log(response.body);
  }

  return response;
};

async function processZoomInput(input) {
  return input;
}

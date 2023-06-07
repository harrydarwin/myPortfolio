require('dotenv').config()
const crypto = require('crypto');

exports.handler = async function (event, context) {
  console.log('EVENT BABY:', event);

  let response = {};
  const requestBody = event.body ? JSON.parse(event.body) : '';

  console.log('HEADERs', event.headers);
  console.log('Body', requestBody);

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

      const thing = await processZoomInput(response);

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

// Import the necessary libraries
const express = require('express');
const twilio = require('twilio');

// Load credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// --- ⚠️ ACTION REQUIRED ---
// Replace these placeholders with the actual E.164 formatted phone numbers.
const OFFICE_PHONE_NUMBER = '+16473812401'; // Fictional Ashburn Office Number
const REMOTE_PCC_NUMBER = '+16473812401';   // Fictional Emily's Number
// -------------------------

// Initialize the Twilio client and the Express app
const client = twilio(accountSid, authToken);
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// This is the main endpoint that Vapi will call for the patient_intake tool.
app.post('/api/transfer', (req, res) => {
    console.log('Received transfer request from Vapi.');

    // Vapi's payload structure wraps the tool call in a 'message' object.
    const args = JSON.parse(req.body.message.toolCall.function.arguments);

    const { fullName, patientStatus, reason } = args;
    console.log(`Patient: ${fullName}, Status: ${patientStatus}, Reason: ${reason}`);

    // Create the TwiML response to tell Twilio what to do.
    const twiml = new twilio.twiml.VoiceResponse();

    // The <Dial> verb attempts to connect the call.
    // The 'action' URL is where Twilio will send a request AFTER this dial attempt ends.
    twiml.dial({
        action: '/api/handle-first-dial-status',
        method: 'POST',
        timeout: '20', // Seconds to ring before timing out (approx. 4-5 rings)
        callerId: twilioPhoneNumber,
    }, OFFICE_PHONE_NUMBER);

    // Send the TwiML back to execute the dial.
    res.type('text/xml');
    res.send(twiml.toString());
});

// This endpoint is called ONLY by Twilio after the first dial attempt is finished.
app.post('/api/handle-first-dial-status', (req, res) => {
    const dialCallStatus = req.body.DialCallStatus;
    console.log(`First dial status: ${dialCallStatus}`);

    const twiml = new twilio.twiml.VoiceResponse();

    // Check if the call was answered or not.
    if (dialCallStatus === 'completed') {
        // The call was answered. Our job is done.
        twiml.hangup();
    } else {
        // The call was not answered. Escalate to the remote coordinator.
        console.log('Office did not answer. Escalating to remote PCC.');
        twiml.say('The office is currently unavailable. Connecting you to our remote coordinator.');
        twiml.dial({ callerId: twilioPhoneNumber }, REMOTE_PCC_NUMBER);
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

// Export the app for Vercel
module.exports = app;


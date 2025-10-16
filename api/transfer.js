// Import the necessary libraries
const express = require('express');
const twilio = require('twilio');

// Load credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// --- ⚠️ ACTION REQUIRED ---
// Ensure these phone numbers are correct and in E.164 format.
const OFFICE_PHONE_NUMBER = '+16473812401';
const REMOTE_PCC_NUMBER = '+16473812401';
// -------------------------

// Initialize the Twilio client
const client = twilio(accountSid, authToken);
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// This is the main endpoint that the patient_intake tool will call.
app.post('/api/transfer', (req, res) => {
    console.log('Received transfer request from Vapi.');

    try {
        // --- ✅ FIX APPLIED ---
        // The toolCall object is directly on the request body, not inside a 'message' object.
        const args = JSON.parse(req.body.toolCall.function.arguments);
        const { fullName, patientStatus, reason } = args;

        // --- ✅ ADDED VALIDATION ---
        // Check if Twilio credentials are loaded correctly
        if (!accountSid || !authToken || !twilioPhoneNumber) {
            throw new Error("Twilio environment variables are not set in Vercel.");
        }

        console.log(`Processing transfer for: Patient: ${fullName}, Status: ${patientStatus}, Reason: ${reason}`);

        // Create the TwiML response to tell Twilio what to do.
        const twiml = new twilio.twiml.VoiceResponse();

        // The <Dial> verb attempts to connect the call.
        twiml.dial({
            action: '/api/handle-first-dial-status',
            method: 'POST',
            timeout: '20', // Seconds to ring before timing out
            callerId: twilioPhoneNumber,
        }, OFFICE_PHONE_NUMBER);

        // Send the TwiML back to execute the dial.
        res.type('text/xml');
        res.send(twiml.toString());

    } catch (error) {
        // --- ✅ ROBUST ERROR HANDLING ---
        // If anything in the 'try' block fails, this code will run instead of crashing.
        console.error("!!! SERVER ERROR IN /api/transfer !!!", error);
        console.error("INCOMING REQUEST BODY THAT CAUSED ERROR:", JSON.stringify(req.body, null, 2));

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say("I'm sorry, we're experiencing a technical difficulty and I'm unable to complete the transfer at this time. A team member will be notified.");
        twiml.hangup();

        // Send a 500 status code to indicate a server error, along with the TwiML message.
        res.type('text/xml');
        res.status(500).send(twiml.toString());
    }
});

// This endpoint is called ONLY by Twilio after the first dial attempt is finished.
app.post('/api/handle-first-dial-status', (req, res) => {
    try {
        const dialCallStatus = req.body.DialCallStatus;
        console.log(`First dial attempt status: ${dialCallStatus}`);

        const twiml = new twilio.twiml.VoiceResponse();

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
    } catch (error) {
        console.error("!!! SERVER ERROR IN /api/handle-first-dial-status !!!", error);
        res.status(500).send('<Response><Hangup/></Response>');
    }
});

// Export the app for Vercel
module.exports = app;

// Import the necessary libraries
const express = require('express');
const twilio = require('twilio');

// Load credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// --- ⚠️ ACTION REQUIRED ---
// Ensure these phone numbers are correct and in E.164 format.
const OFFICE_PHONE_NUMBER = '+16473812401';
const REMOTE_PCC_NUMBER = '+16473812401';
// -------------------------

// Initialize the Twilio client
const client = twilio(accountSid, authToken);
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// This is the main endpoint that the patient_intake tool will call.
app.post('/api/transfer', (req, res) => {
    console.log('Received transfer request from Vapi.');

    try {
        // --- ✅ FIX APPLIED ---
        // The toolCall object is directly on the request body, not inside a 'message' object.
        const args = JSON.parse(req.body.toolCall.function.arguments);
        const { fullName, patientStatus, reason } = args;

        // --- ✅ ADDED VALIDATION ---
        // Check if Twilio credentials are loaded correctly
        if (!accountSid || !authToken || !twilioPhoneNumber) {
            throw new Error("Twilio environment variables are not set in Vercel.");
        }

        console.log(`Processing transfer for: Patient: ${fullName}, Status: ${patientStatus}, Reason: ${reason}`);

        // Create the TwiML response to tell Twilio what to do.
        const twiml = new twilio.twiml.VoiceResponse();

        // The <Dial> verb attempts to connect the call.
        twiml.dial({
            action: '/api/handle-first-dial-status',
            method: 'POST',
            timeout: '20', // Seconds to ring before timing out
            callerId: twilioPhoneNumber,
        }, OFFICE_PHONE_NUMBER);

        // Send the TwiML back to execute the dial.
        res.type('text/xml');
        res.send(twiml.toString());

    } catch (error) {
        // --- ✅ ROBUST ERROR HANDLING ---
        // If anything in the 'try' block fails, this code will run instead of crashing.
        console.error("!!! SERVER ERROR IN /api/transfer !!!", error);
        console.error("INCOMING REQUEST BODY THAT CAUSED ERROR:", JSON.stringify(req.body, null, 2));

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say("I'm sorry, we're experiencing a technical difficulty and I'm unable to complete the transfer at this time. A team member will be notified.");
        twiml.hangup();

        // Send a 500 status code to indicate a server error, along with the TwiML message.
        res.type('text/xml');
        res.status(500).send(twiml.toString());
    }
});

// This endpoint is called ONLY by Twilio after the first dial attempt is finished.
app.post('/api/handle-first-dial-status', (req, res) => {
    try {
        const dialCallStatus = req.body.DialCallStatus;
        console.log(`First dial attempt status: ${dialCallStatus}`);

        const twiml = new twilio.twiml.VoiceResponse();

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
    } catch (error) {
        console.error("!!! SERVER ERROR IN /api/handle-first-dial-status !!!", error);
        res.status(500).send('<Response><Hangup/></Response>');
    }
});

// Export the app for Vercel
module.exports = app;


// ElevenLabs Conversational AI Booking Webhook
// Handles appointment booking requests from phone calls via ElevenLabs + Twilio

const https = require('https');

// GoHighLevel API configuration
const GHL_API_URL = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY || 'pit-d6b661eb-5662-4b97-acb9-dd7360bb1c0f';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'fl5rL3eZQWBq2GYlDPkl';
const GHL_CALENDAR_ID = process.env.GHL_CALENDAR_ID || '9Wq5P2CPKpgfKpnM6LkT';

// Make GHL API request
function ghlRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';

    const options = {
      hostname: 'services.leadconnectorhq.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode >= 400) {
            console.error('GHL API Error:', res.statusCode, result);
            reject(new Error(result.message || 'GHL API error'));
          } else {
            resolve(result);
          }
        } catch (e) {
          console.error('JSON Parse Error:', responseData);
          resolve({ raw: responseData });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Create or update contact in GHL
async function createOrUpdateContact(customerData) {
  const { name, email, phone } = customerData;

  // Split name into first and last
  const nameParts = (name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const contactPayload = {
    locationId: GHL_LOCATION_ID,
    firstName,
    lastName,
    email: email || '',
    phone: phone || '',
    source: 'Phone Call - ElevenLabs AI',
    tags: ['phone-lead', 'elevenlabs-ai', 'discovery-call-requested']
  };

  console.log('Creating/updating contact:', contactPayload);

  try {
    // Try to find existing contact by phone or email
    if (phone) {
      const searchPath = `/contacts/search?locationId=${GHL_LOCATION_ID}&phone=${encodeURIComponent(phone)}`;
      const existingContacts = await ghlRequest(searchPath, 'GET');

      if (existingContacts.contacts && existingContacts.contacts.length > 0) {
        const contactId = existingContacts.contacts[0].id;
        console.log('Found existing contact:', contactId);

        // Update existing contact
        await ghlRequest(`/contacts/${contactId}`, 'PUT', contactPayload);
        return existingContacts.contacts[0];
      }
    }

    // Create new contact if not found
    const result = await ghlRequest('/contacts/', 'POST', contactPayload);
    return result.contact;
  } catch (error) {
    console.error('Error creating/updating contact:', error);
    throw error;
  }
}

// Create appointment in GHL
async function createAppointment(contact, appointmentData) {
  const { preferredDate, preferredTime, notes } = appointmentData;

  // Convert preferred date/time to ISO format
  // Expected format from ElevenLabs: "2024-02-15" and "14:00" or "2pm"
  let startTime;

  try {
    if (preferredDate && preferredTime) {
      // Parse time - handle both 24h and 12h formats
      let hours, minutes;

      if (preferredTime.toLowerCase().includes('pm') || preferredTime.toLowerCase().includes('am')) {
        // 12-hour format
        const timeMatch = preferredTime.match(/(\d+):?(\d*)?\s*(am|pm)/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const isPM = timeMatch[3].toLowerCase() === 'pm';

          if (isPM && hours !== 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
        }
      } else {
        // 24-hour format
        const timeMatch = preferredTime.match(/(\d+):?(\d*)?/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        }
      }

      // Create ISO datetime
      const dateTime = new Date(preferredDate);
      dateTime.setHours(hours || 14, minutes || 0, 0, 0); // Default to 2 PM if parsing fails
      startTime = dateTime.toISOString();
    } else {
      // Default to next business day at 2 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      startTime = tomorrow.toISOString();
    }
  } catch (error) {
    console.error('Error parsing date/time:', error);
    // Fallback to next business day at 2 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    startTime = tomorrow.toISOString();
  }

  // End time is 45 minutes after start (discovery call duration)
  const endTime = new Date(new Date(startTime).getTime() + 45 * 60000).toISOString();

  const appointmentPayload = {
    locationId: GHL_LOCATION_ID,
    calendarId: GHL_CALENDAR_ID,
    contactId: contact.id,
    title: `Discovery Call - ${contact.firstName} ${contact.lastName}`.trim(),
    appointmentStatus: 'confirmed',
    startTime,
    endTime,
    notes: notes || 'Booked via phone call with ElevenLabs AI agent'
  };

  console.log('Creating appointment:', appointmentPayload);

  try {
    const result = await ghlRequest('/appointments/', 'POST', appointmentPayload);
    console.log('Appointment created:', result);
    return result.appointment || result;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

// Main handler
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    console.log('Received booking request:', JSON.stringify(requestBody, null, 2));

    // Extract data from ElevenLabs request
    // Expected format:
    // {
    //   "name": "John Doe",
    //   "email": "john@example.com",
    //   "phone": "+1234567890",
    //   "preferredDate": "2024-02-15",
    //   "preferredTime": "2pm",
    //   "notes": "Optional notes from conversation"
    // }

    const { name, email, phone, preferredDate, preferredTime, notes } = requestBody;

    // Validate required fields
    if (!name || !phone) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: false,
          error: 'Name and phone number are required',
          message: 'I need your name and phone number to book the appointment.'
        })
      };
    }

    // Step 1: Create or update contact in GHL
    const contact = await createOrUpdateContact({ name, email, phone });
    console.log('Contact created/updated:', contact.id);

    // Step 2: Create appointment
    const appointment = await createAppointment(contact, {
      preferredDate,
      preferredTime,
      notes
    });

    console.log('Appointment booked successfully:', appointment.id || appointment);

    // Return success response for ElevenLabs
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: `Perfect! I've scheduled your discovery call${preferredDate ? ` for ${preferredDate} at ${preferredTime}` : ''}. You'll receive a confirmation email shortly at ${email || 'the email we have on file'}. Looking forward to speaking with you!`,
        contactId: contact.id,
        appointmentId: appointment.id || 'created',
        appointmentTime: appointment.startTime || 'scheduled'
      })
    };

  } catch (error) {
    console.error('Error processing booking:', error);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to book appointment',
        message: 'I apologize, but I encountered an issue booking your appointment. Let me transfer you to a team member who can help you directly.',
        details: error.message
      })
    };
  }
};

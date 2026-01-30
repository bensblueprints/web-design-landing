const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// GoHighLevel API configuration
const GHL_API_URL = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Airwallex API configuration
const AIRWALLEX_API_URL = process.env.AIRWALLEX_API_URL || 'https://api.airwallex.com';
const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;

// Get Airwallex access token
async function getAirwallexToken() {
  try {
    const response = await fetch(`${AIRWALLEX_API_URL}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': AIRWALLEX_CLIENT_ID,
        'x-api-key': AIRWALLEX_API_KEY
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Airwallex Auth Error:', result);
      return null;
    }

    return result.token;
  } catch (error) {
    console.error('Airwallex Auth API Error:', error);
    return null;
  }
}

// Create Airwallex payment link for $100 consultation fee
async function createAirwallexPaymentLink(leadData, leadId) {
  const token = await getAirwallexToken();
  if (!token) return null;

  const { name, email } = leadData;

  // Split name into first and last
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const paymentLinkPayload = {
    amount: 100,
    currency: 'USD',
    title: 'Web Design Consultation Fee',
    description: 'Non-refundable $100 consultation fee to schedule your discovery call with Advanced Marketing.',
    reusable: false,
    reference: `LEAD-${leadId}`,
    shopper: {
      email: email,
      first_name: firstName,
      last_name: lastName
    },
    collectable_shopper_info: {
      phone_number: false,
      shipping_address: false
    }
  };

  try {
    const response = await fetch(`${AIRWALLEX_API_URL}/api/v1/pa/payment_links/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentLinkPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Airwallex Payment Link Error:', result);
      return null;
    }

    console.log('Airwallex Payment Link created:', result.id);
    return result;
  } catch (error) {
    console.error('Airwallex Payment Link API Error:', error);
    return null;
  }
}

// Create contact in GoHighLevel
async function createGHLContact(leadData) {
  const { name, company, email, phone, budget, project } = leadData;

  // Split name into first and last
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const contactPayload = {
    firstName,
    lastName,
    email,
    phone,
    companyName: company || '',
    locationId: GHL_LOCATION_ID,
    source: 'Advanced Marketing Landing Page',
    tags: ['web-design-lead', 'pending-payment', budget ? `budget-${budget}` : 'budget-unknown'],
    customFields: [
      { key: 'budget', value: budget || 'Not specified' },
      { key: 'project_details', value: project || 'Not provided' }
    ]
  };

  try {
    const response = await fetch(`${GHL_API_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(contactPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('GHL Contact Error:', result);
      return null;
    }

    console.log('GHL Contact created:', result.contact?.id);
    return result.contact;
  } catch (error) {
    console.error('GHL Contact API Error:', error);
    return null;
  }
}

// Create opportunity in GoHighLevel pipeline
async function createGHLOpportunity(contact, leadData) {
  if (!contact || !contact.id) return null;

  const { budget, project } = leadData;

  // Map budget to monetary value
  const monetaryValues = {
    '1000-2500': 1500,
    '2500-5000': 3500,
    '5000+': 7500,
    'not-sure': 2500
  };

  const opportunityPayload = {
    pipelineId: process.env.GHL_PIPELINE_ID,
    locationId: GHL_LOCATION_ID,
    name: `Advanced Marketing - ${contact.firstName} ${contact.lastName}`.trim(),
    pipelineStageId: process.env.GHL_STAGE_NEW_LEAD,
    status: 'open',
    contactId: contact.id,
    monetaryValue: monetaryValues[budget] || 2500,
    source: 'Landing Page'
  };

  try {
    const response = await fetch(`${GHL_API_URL}/opportunities/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(opportunityPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('GHL Opportunity Error:', result);
      return null;
    }

    console.log('GHL Opportunity created:', result.opportunity?.id);
    return result.opportunity;
  } catch (error) {
    console.error('GHL Opportunity API Error:', error);
    return null;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    let data;

    // Parse form data (URL encoded or JSON)
    const contentType = event.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      data = JSON.parse(event.body);
    } else {
      // Parse URL encoded form data
      const params = new URLSearchParams(event.body);
      data = {
        name: params.get('name'),
        company: params.get('company'),
        email: params.get('email'),
        phone: params.get('phone'),
        budget: params.get('budget'),
        project: params.get('project')
      };
    }

    const { name, company, email, phone, budget, project } = data;

    // Validate required fields
    if (!name || !email || !phone) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Name, email, and phone are required' })
      };
    }

    // 1. Save to Neon database
    const dbResult = await sql`
      INSERT INTO leads (name, company, email, phone, budget, project_details)
      VALUES (${name}, ${company || null}, ${email}, ${phone}, ${budget || null}, ${project || null})
      RETURNING id, created_at
    `;
    console.log('Lead saved to DB:', dbResult[0]);
    const leadId = dbResult[0].id;

    // 2. Create contact in GoHighLevel
    let ghlContact = null;
    let ghlOpportunity = null;

    if (GHL_API_KEY && GHL_LOCATION_ID) {
      ghlContact = await createGHLContact(data);

      // 3. Create opportunity in pipeline (if pipeline is configured)
      if (ghlContact && process.env.GHL_PIPELINE_ID) {
        ghlOpportunity = await createGHLOpportunity(ghlContact, data);
      }
    } else {
      console.log('GHL integration skipped - missing API credentials');
    }

    // 4. Create Airwallex payment link for $100 consultation fee
    let paymentLink = null;
    if (AIRWALLEX_CLIENT_ID && AIRWALLEX_API_KEY) {
      paymentLink = await createAirwallexPaymentLink(data, leadId);
    } else {
      console.log('Airwallex integration skipped - missing API credentials');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: paymentLink
          ? 'Please complete your $100 consultation fee to secure your meeting slot.'
          : 'Thank you! We\'ll be in touch within 24 hours.',
        lead_id: leadId,
        ghl_contact_id: ghlContact?.id || null,
        ghl_opportunity_id: ghlOpportunity?.id || null,
        payment_url: paymentLink?.url || null,
        payment_required: !!paymentLink
      })
    };

  } catch (error) {
    console.error('Error saving lead:', error);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to save your inquiry. Please try again.' })
    };
  }
};

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

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

    // Insert into database
    const result = await sql`
      INSERT INTO leads (name, company, email, phone, budget, project_details)
      VALUES (${name}, ${company || null}, ${email}, ${phone}, ${budget || null}, ${project || null})
      RETURNING id, created_at
    `;

    console.log('Lead saved:', result[0]);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Thank you! We\'ll be in touch within 24 hours.',
        lead_id: result[0].id
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

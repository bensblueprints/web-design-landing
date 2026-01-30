const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_LXjW0JE4vfid@ep-empty-wave-aegmthgm.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function setup() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        budget VARCHAR(50),
        project_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Leads table created successfully!');

    // Verify the table was created
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'leads'`;
    console.log('Table exists:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

setup();

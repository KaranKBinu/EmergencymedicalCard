const { Pool } = require('@neondatabase/serverless');
const { WebSocket } = require('ws');
require('dotenv').config();

async function test() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
  if (!process.env.DATABASE_URL) return;

  const connectionString = process.env.DATABASE_URL.replace(/^["']|["']$/g, '').trim();
  console.log('Connection string prefix:', connectionString.substring(0, 15));

  try {
    const pool = new Pool({ connectionString });
    console.log('Pool created, attempting query...');
    const res = await pool.query('SELECT NOW()');
    console.log('Query successful:', res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();

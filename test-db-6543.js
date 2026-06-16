const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yhdgnwzttihiinhofgoy:MIelpogi12!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Success (6543):', res.rows[0]);
    pool.end();
  })
  .catch(err => {
    console.error('Error (6543):', err.message);
    pool.end();
  });

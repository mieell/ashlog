const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yhdgnwzttihiinhofgoy:MIelpogi12!@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Success (5432):', res.rows[0]);
    pool.end();
  })
  .catch(err => {
    console.error('Error (5432):', err.message);
    pool.end();
  });

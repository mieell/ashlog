const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yhdgnwzttihiinhofgoy:MIelpogi12%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
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

const pool5432 = new Pool({
  connectionString: 'postgresql://postgres.yhdgnwzttihiinhofgoy:MIelpogi12%21@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool5432.query('SELECT NOW()')
  .then(res => {
    console.log('Success (5432):', res.rows[0]);
    pool5432.end();
  })
  .catch(err => {
    console.error('Error (5432):', err.message);
    pool5432.end();
  });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:MIelpogi12!@db.yhdgnwzttihiinhofgoy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Success (Direct):', res.rows[0]);
    pool.end();
  })
  .catch(err => {
    console.error('Error (Direct):', err.message);
    pool.end();
  });

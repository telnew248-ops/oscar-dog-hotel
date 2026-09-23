const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.steadtxkidcyqebxtmvf:OscarHotel2026!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
const ORG_ID = '00000000-0000-0000-0000-000000000001';
async function cleanup() {
  await client.connect();
  console.log('Connected');
  const before = await client.query('SELECT (SELECT COUNT(*) FROM status_history WHERE organization_id = ) AS sh, (SELECT COUNT(*) FROM bookings WHERE organization_id = ) AS bk, (SELECT COUNT(*) FROM dogs WHERE organization_id = ) AS dg, (SELECT COUNT(*) FROM owners WHERE organization_id = ) AS ow', [ORG_ID]);
  console.log('BEFORE:', JSON.stringify(before.rows[0]));
  await client.query('DELETE FROM status_history WHERE organization_id = ', [ORG_ID]);
  await client.query('DELETE FROM bookings WHERE organization_id = ', [ORG_ID]);
  await client.query('DELETE FROM dogs WHERE organization_id = ', [ORG_ID]);
  await client.query('DELETE FROM owners WHERE organization_id = ', [ORG_ID]);
  const after = await client.query('SELECT (SELECT COUNT(*) FROM status_history WHERE organization_id = ) AS sh, (SELECT COUNT(*) FROM bookings WHERE organization_id = ) AS bk, (SELECT COUNT(*) FROM dogs WHERE organization_id = ) AS dg, (SELECT COUNT(*) FROM owners WHERE organization_id = ) AS ow', [ORG_ID]);
  console.log('AFTER:', JSON.stringify(after.rows[0]));
  await client.end();
  console.log('Done!');
}
cleanup().catch(e => { console.error(e.message); process.exit(1); });

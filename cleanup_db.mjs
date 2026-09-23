import pkg from 'pg';
const { Client } = pkg;
const ORG_ID = '00000000-0000-0000-0000-000000000001';
const client = new Client({
  connectionString: 'postgresql://postgres.steadtxkidcyqebxtmvf:OscarHotel2026!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
async function cleanup() {
  await client.connect();
  console.log('Connected');
  const r1 = await client.query("DELETE FROM status_history WHERE organization_id = '" + ORG_ID + "'");
  console.log('Deleted status_history:', r1.rowCount);
  const r2 = await client.query("DELETE FROM bookings WHERE organization_id = '" + ORG_ID + "'");
  console.log('Deleted bookings:', r2.rowCount);
  const r3 = await client.query("DELETE FROM dogs WHERE organization_id = '" + ORG_ID + "'");
  console.log('Deleted dogs:', r3.rowCount);
  const r4 = await client.query("DELETE FROM owners WHERE organization_id = '" + ORG_ID + "'");
  console.log('Deleted owners:', r4.rowCount);
  const check = await client.query("SELECT (SELECT COUNT(*) FROM dogs WHERE organization_id = '" + ORG_ID + "') as dogs, (SELECT COUNT(*) FROM bookings WHERE organization_id = '" + ORG_ID + "') as bookings");
  console.log('VERIFY:', JSON.stringify(check.rows[0]));
  await client.end();
  console.log('DONE!');
}
cleanup().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

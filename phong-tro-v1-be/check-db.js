const net = require('net');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL is not defined in .env');
  process.exit(1);
}

// Parse simple connection string... or just use hardcoded defaults for check
// postgres://postgres:postgres@localhost:5432/phongtro_db?schema=public

const match = dbUrl.match(/@([^:]+):(\d+)/);
const host = match ? match[1] : 'localhost';
const port = match ? parseInt(match[2]) : 5432;

console.log(`Testing connection to ${host}:${port}...`);

const socket = new net.Socket();

socket.setTimeout(3000);

socket.on('connect', () => {
  console.log(`✅ Success! Port ${port} is open and accepting connections.`);
  socket.destroy();
  process.exit(0);
});

socket.on('timeout', () => {
  console.error(`❌ Timeout! Could not connect to ${host}:${port}. Is the database running?`);
  socket.destroy();
  process.exit(1);
});

socket.on('error', (err) => {
  console.error(`❌ Error! Could not connect to ${host}:${port}.`);
  console.error(`Root cause: ${err.message}`);
  socket.destroy();
  process.exit(1);
});

socket.connect(port, host);
